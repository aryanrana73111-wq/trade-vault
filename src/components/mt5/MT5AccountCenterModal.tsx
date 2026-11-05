import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Server,
  Layers,
  ExternalLink,
  Building,
  Terminal,
  Eye,
  EyeOff,
  Copy,
  Check,
  HelpCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mt5ClientService } from '@/services/mt5ClientService';
import { 
  MT5_POPULAR_BROKERS, 
  detectBrokerFromServer, 
  getBrokerCapabilities,
  MT5BrokerEntry 
} from '@/lib/mt5BrokerDirectory';
import { 
  MT5AccountCredentials, 
  ConnectedTradingAccount, 
  MT5SyncResult,
  BrokerCapabilities,
  MT5CreationResult
} from '@/types/mt5';
import { useAuth } from '@/contexts/AuthContext';
import { SuccessCelebration } from './SuccessCelebration';
import { MT5OpenPositionsModal } from './MT5OpenPositionsModal';
import { formatCurrency } from '@/lib/utils';

interface MT5AccountCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: ConnectedTradingAccount) => void;
  targetDashboardId?: string;
  initialTab?: 'connect' | 'create';
}

export function MT5AccountCenterModal({
  isOpen,
  onClose,
  onSuccess,
  targetDashboardId,
  initialTab = 'connect'
}: MT5AccountCenterModalProps) {
  const { activeDashboard, user } = useAuth();
  const effectiveDashboardId = targetDashboardId || activeDashboard?.id || 'default';

  // Navigation tab: 'connect' | 'create'
  const [activeTab, setActiveTab] = useState<'connect' | 'create'>(initialTab || 'connect');

  // --- TAB 1: Connect Existing Form States ---
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [server, setServer] = useState('');
  const [serverSearchQuery, setServerSearchQuery] = useState('');
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [startingBalance, setStartingBalance] = useState<number>(10000);
  const [customStartingBalance, setCustomStartingBalance] = useState<string>('');
  const [initialSyncPeriod, setInitialSyncPeriod] = useState<string>('30');

  // --- TAB 2: Create Account Form States ---
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('sharkfunded');
  const [createDeposit, setCreateDeposit] = useState<number>(10000);
  const [createLeverage, setCreateLeverage] = useState<number>(100);
  const [createCurrency, setCreateCurrency] = useState<string>('USD');
  const [createServer, setCreateServer] = useState<string>('');
  const [createName, setCreateName] = useState<string>('');
  const [createEmail, setCreateEmail] = useState<string>('');

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [creationProgressStep, setCreationProgressStep] = useState<string>('Initializing...');
  const [creationResult, setCreationResult] = useState<MT5CreationResult | null>(null);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Copy feedback states
  const [copiedLogin, setCopiedLogin] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedServer, setCopiedServer] = useState(false);
  const [showCreatedPassword, setShowCreatedPassword] = useState(false);

  // Status & Progress
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncProgressStep, setSyncProgressStep] = useState<string>('Connecting...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnectorNotConfigured, setIsConnectorNotConfigured] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<ConnectedTradingAccount | null>(null);
  const [syncResult, setSyncResult] = useState<MT5SyncResult | null>(null);
  const [positionsAccount, setPositionsAccount] = useState<ConnectedTradingAccount | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'connect');
      setErrorMessage(null);
      setCreationError(null);
      setConnectedAccount(null);
      setCreationResult(null);
      setSyncResult(null);
      setPassword('');
      if (user?.displayName && !createName) setCreateName(user.displayName);
      if (user?.email && !createEmail) setCreateEmail(user.email);

      // Proactively check MT5 Cloud Gateway configuration
      mt5ClientService.checkConnectorConfig().then((cfg) => {
        setIsConnectorNotConfigured(!cfg.configured);
      }).catch(() => {});
    }
  }, [isOpen, initialTab]);

  const selectedBroker = MT5_POPULAR_BROKERS.find(b => b.id === selectedBrokerId) || MT5_POPULAR_BROKERS[0];
  const brokerCapabilities: BrokerCapabilities = selectedBroker.capabilities;

  if (!isOpen) return null;

  // Known servers suggestion list for Tab 1
  const allServers = MT5_POPULAR_BROKERS.flatMap(b => 
    b.servers.map(s => ({
      server: s.name,
      broker: b.name,
      type: s.type,
      description: s.description
    }))
  );

  const filteredServers = allServers.filter(s => 
    s.server.toLowerCase().includes((serverSearchQuery || server).toLowerCase()) ||
    s.broker.toLowerCase().includes((serverSearchQuery || server).toLowerCase())
  );

  // Handle Connect Existing MT5 Account
  const handleConnect = async () => {
    const targetLogin = loginId.trim();
    const targetPass = password.trim();
    const targetServer = server.trim();

    if (!targetLogin) {
      setErrorMessage('MT5 connection failed: Login ID is required.');
      return;
    }
    if (!targetPass) {
      setErrorMessage('MT5 connection failed: Password is required.');
      return;
    }
    if (!targetServer) {
      setErrorMessage('MT5 connection failed: Server is required.');
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);
    setIsConnectorNotConfigured(false);
    setSyncProgressStep('Connecting to MT5 broker terminal bridge...');

    try {
      const detected = detectBrokerFromServer(targetServer);
      const finalStartingBalance = customStartingBalance.trim()
        ? parseFloat(customStartingBalance.replace(/[^0-9.]/g, '')) || startingBalance
        : startingBalance;

      const credentials: MT5AccountCredentials = {
        broker: detected.broker,
        server: targetServer,
        accountNumber: targetLogin,
        investorPassword: targetPass,
        connectionType: detected.connectionType,
        challengeStartingBalance: finalStartingBalance,
        startingBalance: finalStartingBalance,
        initialSyncPeriod,
        readOnly: true,
        label: `${detected.broker} (${detected.connectionType.toUpperCase()})`
      };

      setSyncProgressStep('Authenticating credentials with broker server...');
      const { account } = await mt5ClientService.connectAccount(credentials, effectiveDashboardId);

      setSyncProgressStep('Importing actual MT5 trade history...');
      const periodDays = parseInt(initialSyncPeriod, 10) || 30;
      const syncRes = await mt5ClientService.syncTrades(account.id, effectiveDashboardId, periodDays);

      setConnectedAccount(account);
      setSyncResult(syncRes);
      if (onSuccess) onSuccess(account);
    } catch (err: any) {
      const msg = err?.message || 'MT5 connection failed';
      const code = err?.errorCode;
      if (code === 'MT5_CONNECTOR_NOT_CONFIGURED' || msg.includes('not configured') || msg.includes('META_API_TOKEN')) {
        setIsConnectorNotConfigured(true);
        setErrorMessage('MT5 connector is not configured on the server.');
      } else {
        setErrorMessage(msg.startsWith('MT5 connection failed') ? msg : `MT5 connection failed: ${msg}`);
      }
    } finally {
      setIsConnecting(false);
      // Strictly clear password from React state immediately after request completes
      setPassword('');
    }
  };

  // Handle Real Demo Account Creation
  const handleCreateDemo = async () => {
    setIsCreatingAccount(true);
    setCreationError(null);
    setCreationResult(null);
    setCreationProgressStep('Contacting broker provisioning gateway...');

    try {
      setCreationProgressStep('Requesting MT5 account creation from broker...');
      const targetServer = createServer || selectedBroker.servers.find(s => s.type === 'demo')?.name || selectedBroker.servers[0]?.name;

      const result = await mt5ClientService.createDemoAccount({
        brokerId: selectedBroker.id,
        server: targetServer,
        deposit: createDeposit,
        balance: createDeposit,
        leverage: createLeverage,
        currency: createCurrency,
        name: createName.trim() || undefined,
        email: createEmail.trim() || undefined
      });

      setCreationResult(result);

      if (result.account && onSuccess) {
        onSuccess(result.account);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to provision MT5 demo account with broker';
      if (msg.includes('not configured') || msg.includes('MT5_CONNECTOR_NOT_CONFIGURED')) {
        setIsConnectorNotConfigured(true);
      }
      setCreationError(msg);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const copyToClipboard = (text: string, type: 'login' | 'password' | 'server') => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'login') {
        setCopiedLogin(true);
        setTimeout(() => setCopiedLogin(false), 2000);
      } else if (type === 'password') {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      } else if (type === 'server') {
        setCopiedServer(true);
        setTimeout(() => setCopiedServer(false), 2000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* If successfully connected, show celebration */}
        {connectedAccount ? (
          <SuccessCelebration
            account={connectedAccount}
            syncResult={syncResult}
            onGoToDashboard={() => onClose()}
            onViewPositions={() => setPositionsAccount(connectedAccount)}
            onConnectAnother={() => {
              setConnectedAccount(null);
              setSyncResult(null);
              setLoginId('');
              setPassword('');
              setServer('');
              setActiveTab('connect');
            }}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100">MT5 Account Center</h2>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      Direct MT5 Gateway
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Connect existing MT5 accounts or create verified demo accounts through real broker gateways
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose} 
                disabled={isConnecting || isCreatingAccount}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR: Connect Existing MT5 vs Create MT5 Account */}
            <div className="px-6 pt-4 pb-2 bg-slate-950/20 border-b border-slate-800/80">
              <div className="grid grid-cols-2 p-1 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('connect');
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'connect'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Connect Existing MT5</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('create');
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'create'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Create MT5 Account</span>
                </button>
              </div>
            </div>

            {/* Error or Not Configured Banner */}
            {isConnectorNotConfigured ? (
              <div className="mx-6 mt-4 p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl text-xs text-amber-200 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>MT5 Connector Not Configured</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConnectorNotConfigured(false)}
                    className="p-1 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-amber-900/40 transition-colors"
                    title="Dismiss notice"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Real MT5 integration requires an external cloud provider. TradeVault refuses to simulate fake connections, fabricate balances, or generate fake logins.
                </p>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-slate-400 font-semibold">Administrator Action:</div>
                  <div>Configure <span className="text-emerald-400 font-bold">META_API_TOKEN</span> in your server environment variables.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Building className="w-3 h-3" />
                    <span>Explore Broker Directory</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 transition-colors"
                  >
                    Enter Trades Manually
                  </button>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="mx-6 mt-4 p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-[11px] text-rose-300/80">
                    {errorMessage.toLowerCase().includes('not configured') || errorMessage.toLowerCase().includes('meta_api_token')
                      ? 'Real-time MT5 bridge requires the META_API_TOKEN server secret. You can also explore free broker demo accounts or log trades manually.'
                      : errorMessage.toLowerCase().includes('server') || errorMessage.toLowerCase().includes('unreachable')
                      ? 'Verify that your broker server name matches your broker\'s MT5 terminal server list exactly (e.g. SharkFunded-Live, ICMarkets-Demo).'
                      : errorMessage.toLowerCase().includes('login') || errorMessage.toLowerCase().includes('password')
                      ? 'Please enter both your MT5 account number and investor or master password to connect.'
                      : 'Verify that your MT5 login ID, server name, and password match your broker credentials exactly.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 transition-colors shrink-0"
                  title="Dismiss error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* CONNECT TAB */}
              {activeTab === 'connect' ? (
                isConnecting ? (
                  /* Connecting Spinner Animation */
                  <div className="py-12 text-center space-y-5 animate-in fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto shadow-inner text-blue-400">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-100">Authenticating MT5 Connection</h3>
                      <p className="text-xs text-blue-400 font-mono animate-pulse">{syncProgressStep}</p>
                    </div>

                    <div className="max-w-xs mx-auto space-y-2 text-left bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                        <span>Verifying authenticated server {server}...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Deriving user authorization from token...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reading authoritative balance & equity...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Connect Existing MT5 Form */
                  <div className="space-y-4">
                    {/* FIELD 1: Broker Server */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Broker Server (e.g. SharkFunded-Live, ICMarkets-Demo)
                        </label>
                        <span className="text-[11px] text-slate-500 font-mono">Exact Match Required</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Server className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={server}
                          onChange={e => {
                            setServer(e.target.value);
                            setServerSearchQuery(e.target.value);
                            setShowServerDropdown(true);
                          }}
                          onFocus={() => setShowServerDropdown(true)}
                          placeholder="Type or select broker server name..."
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Server Suggestions Dropdown */}
                      {showServerDropdown && filteredServers.length > 0 && (
                        <div className="absolute z-20 mt-1.5 w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-800/60">
                          {filteredServers.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setServer(s.server);
                                setShowServerDropdown(false);
                              }}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-mono font-bold text-slate-100">{s.server}</span>
                                <span className="text-slate-400 ml-2 font-sans">({s.broker})</span>
                              </div>
                              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                                s.type === 'demo' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {s.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* FIELD 2: MT5 Account Login */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          MT5 Account Login Number
                        </label>
                        <span className="text-[11px] text-slate-500 font-mono">Provided by broker</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={loginId}
                          onChange={e => setLoginId(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="e.g. 10928374"
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* FIELD 3: Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Password (Investor Read-Only or Master)
                        </label>
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Investor password supported
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Enter your MT5 investor or master password"
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* FIELD 4: Challenge Size (Metadata Only) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Challenge Size / Original Starting Balance (Metadata Only)
                        </label>
                        <span className="text-[11px] text-blue-400 font-mono">
                          $10K Standard for Shark Funded
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[10000, 25000, 50000, 100000].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setStartingBalance(amt);
                              setCustomStartingBalance('');
                            }}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold font-mono border transition-all ${
                              startingBalance === amt && !customStartingBalance
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            ${amt >= 1000 ? `${amt / 1000}K` : amt}
                          </button>
                        ))}
                      </div>
                      <div className="pt-1">
                        <input
                          type="text"
                          value={customStartingBalance}
                          onChange={e => setCustomStartingBalance(e.target.value)}
                          placeholder="Or enter custom size (e.g. 10000)"
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Metadata only. Never overrides actual live MT5 balance or equity returned by the broker.
                      </p>
                    </div>

                    {/* FIELD 5: Initial Sync Period */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Initial Trade Import Window
                      </label>
                      <select
                        value={initialSyncPeriod}
                        onChange={e => setInitialSyncPeriod(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="30">Last 30 Days (Recommended)</option>
                        <option value="1">Today</option>
                        <option value="7">Last 7 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="180">Last 6 Months</option>
                        <option value="365">Last 1 Year</option>
                        <option value="3650">All Available History</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Only genuine closed deals from the authenticated MT5 account are imported.
                      </p>
                    </div>

                    {/* Read-Only Safety Note */}
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        TradeVault strictly imports trading data into your private journal. TradeVault cannot place, close, or modify orders on your broker account.
                      </p>
                    </div>

                    {/* Connect MT5 Button */}
                    <div className="pt-2">
                      <Button
                        onClick={handleConnect}
                        disabled={!loginId || !password || !server || isConnecting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Authenticate & Connect MT5</span>
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                /* ============================================== */
                /* TAB 2: CREATE MT5 ACCOUNT                      */
                /* ============================================== */
                <div className="space-y-5">
                  {/* Result Card if Created */}
                  {creationResult ? (
                    <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                            creationResult.status === 'READY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {creationResult.status === 'READY' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <HelpCircle className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">
                              {creationResult.status === 'READY' ? 'MT5 Account Ready' : 'Account Provisioned — Verification Pending'}
                            </h4>
                            <p className="text-xs text-slate-400">
                              {selectedBroker.name} • Server: {creationResult.credentials?.server}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          creationResult.status === 'READY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {creationResult.status}
                        </span>
                      </div>

                      {/* Credentials Display */}
                      {creationResult.credentials && (
                        <div className="space-y-2 bg-slate-900/90 border border-slate-800 p-4 rounded-xl font-mono text-xs">
                          {/* Login */}
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400 font-sans">MT5 Login:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">{creationResult.credentials.login}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(creationResult.credentials!.login, 'login')}
                                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                title="Copy Login"
                              >
                                {copiedLogin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          {creationResult.credentials.password && (
                            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400 font-sans">Password:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-400">
                                  {showCreatedPassword ? creationResult.credentials.password : '••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowCreatedPassword(!showCreatedPassword)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200"
                                >
                                  {showCreatedPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(creationResult.credentials!.password!, 'password')}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                  title="Copy Password"
                                >
                                  {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Server */}
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-400 font-sans">Server:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">{creationResult.credentials.server}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(creationResult.credentials!.server, 'server')}
                                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                title="Copy Server"
                              >
                                {copiedServer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Security Alert: Never stored */}
                      <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <p className="leading-relaxed">
                          Save this password securely. TradeVault does not save passwords in the database and will not display it again.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          onClick={onClose}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                        >
                          Done & Start Journaling
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCreationResult(null);
                            setActiveTab('create');
                          }}
                          className="text-xs"
                        >
                          Create Another
                        </Button>
                      </div>
                    </div>
                  ) : isCreatingAccount ? (
                    /* Creating Spinner */
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-100">Provisioning Real MT5 Account</h4>
                        <p className="text-xs text-blue-400 font-mono animate-pulse">{creationProgressStep}</p>
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Communicating with the broker terminal gateway. This guarantees authentic execution and credentials.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Step 1: Select Broker */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Select Broker or Firm
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {MT5_POPULAR_BROKERS.slice(0, 6).map(broker => (
                            <button
                              key={broker.id}
                              type="button"
                              onClick={() => {
                                setSelectedBrokerId(broker.id);
                                setCreateServer(broker.servers.find(s => s.type === 'demo')?.name || broker.servers[0]?.name || '');
                                setCreationError(null);
                              }}
                              className={`p-3 rounded-2xl text-left border transition-all ${
                                selectedBrokerId === broker.id
                                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs truncate">{broker.name}</span>
                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                                  broker.category === 'prop' ? 'text-purple-400 bg-purple-950/60' : 'text-blue-400 bg-blue-950/60'
                                }`}>
                                  {broker.category === 'prop' ? 'Prop Firm' : 'CFD'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">
                                {broker.capabilities.demoCreationSupported ? 'Creation available' : 'Broker website only'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step 2: Capability-Aware Broker Information */}
                      {brokerCapabilities.category === 'prop' ? (
                        /* Case A: Prop Firm (Shark Funded, FTMO, Funding Pips) */
                        <div className="p-5 bg-purple-950/20 border border-purple-900/40 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2.5 text-purple-300 font-bold text-sm">
                            <Building className="w-5 h-5 text-purple-400" />
                            <span>Proprietary Trading Firm Account</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            <span className="font-semibold text-purple-200">{selectedBroker.name}</span> is an evaluation-based proprietary trading firm. Prop-firm challenge accounts cannot be created by third-party applications and must be opened directly through their official portal.
                          </p>

                          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                            <div className="font-semibold text-slate-200">How to Connect Your Account:</div>
                            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                              <li>Open a challenge or free trial on the official {selectedBroker.name} portal.</li>
                              <li>Retrieve your MT5 Login ID, password, and server.</li>
                              <li>Switch to the <span className="text-blue-400 font-semibold">Connect Existing MT5</span> tab to link your account.</li>
                            </ol>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <a
                              href={brokerCapabilities.demoRegistrationUrl || brokerCapabilities.officialWebsiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                            >
                              <span>Open Official {selectedBroker.name} Website</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <Button
                              variant="outline"
                              onClick={() => {
                                setServer(selectedBroker.servers[0]?.name || '');
                                setActiveTab('connect');
                              }}
                              className="text-xs font-semibold border-slate-700"
                            >
                              Connect Existing MT5
                            </Button>
                          </div>
                        </div>
                      ) : !brokerCapabilities.demoCreationSupported ? (
                        /* Case B: Retail Broker with no automated demo creation API */
                        <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2.5 text-slate-200 font-bold text-sm">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <span>Broker Website Registration Required</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            Demo account creation is not available for <span className="font-semibold text-slate-100">{selectedBroker.name}</span> through TradeVault. Please open a free demo account on the official broker website, then connect it in TradeVault.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <a
                              href={brokerCapabilities.demoRegistrationUrl || brokerCapabilities.officialWebsiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                            >
                              <span>Open Official {selectedBroker.name} Website</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <Button
                              variant="outline"
                              onClick={() => {
                                setServer(selectedBroker.servers[0]?.name || '');
                                setActiveTab('connect');
                              }}
                              className="text-xs font-semibold border-slate-700"
                            >
                              Connect Existing MT5
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Case C: Retail Broker with automated demo creation */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs text-emerald-300">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>Broker creation available via external gateway</span>
                            </div>
                            <span className="font-mono text-[10px] uppercase font-bold">Verified Provider</span>
                          </div>

                          {/* Deposit Selection */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Demo Starting Balance
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {[5000, 10000, 25000, 50000].map(amt => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setCreateDeposit(amt)}
                                  className={`py-2 rounded-xl text-xs font-semibold font-mono border transition-all ${
                                    createDeposit === amt
                                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  ${amt >= 1000 ? `${amt / 1000}K` : amt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Currency & Leverage */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                Account Currency
                              </label>
                              <select
                                value={createCurrency}
                                onChange={e => setCreateCurrency(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                                Leverage
                              </label>
                              <select
                                value={createLeverage}
                                onChange={e => setCreateLeverage(parseInt(e.target.value, 10))}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="30">1:30 (Retail Standard)</option>
                                <option value="100">1:100 (Balanced)</option>
                                <option value="200">1:200</option>
                                <option value="500">1:500 (Pro)</option>
                              </select>
                            </div>
                          </div>

                          {/* Server Selection */}
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                              Demo Server
                            </label>
                            <select
                              value={createServer || selectedBroker.servers.find(s => s.type === 'demo')?.name || selectedBroker.servers[0]?.name}
                              onChange={e => setCreateServer(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {selectedBroker.servers.map(s => (
                                <option key={s.name} value={s.name}>
                                  {s.name} ({s.type}) {s.description ? `— ${s.description}` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Creation Error Banner */}
                          {creationError && (
                            <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-xl text-xs text-rose-300 space-y-2">
                              <div className="flex items-center gap-2 font-semibold">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{creationError}</span>
                              </div>
                              <p className="text-[11px] text-rose-300/80">
                                You can register a demo account directly on the official {selectedBroker.name} website:
                              </p>
                              <a
                                href={brokerCapabilities.demoRegistrationUrl || brokerCapabilities.officialWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-semibold"
                              >
                                <span>Visit {selectedBroker.name} Portal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="pt-2">
                            <Button
                              onClick={handleCreateDemo}
                              disabled={isCreatingAccount}
                              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                              <Building className="w-4 h-4" />
                              <span>Request Real MT5 Demo Account</span>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Live Account Advisory Note */}
                      <div className="pt-3 border-t border-slate-800/60 text-xs text-slate-400 space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-semibold">Looking for a Live Account?</span>
                          <a
                            href={selectedBroker.capabilities.liveRegistrationUrl || selectedBroker.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                          >
                            <span>Open Live Account</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Live accounts require regulatory identity verification (KYC), document upload, and broker approval. Once approved, connect with your investor password on the Connect tab.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Positions Modal */}
      {positionsAccount && (
        <MT5OpenPositionsModal
          account={positionsAccount}
          isOpen={Boolean(positionsAccount)}
          onClose={() => setPositionsAccount(null)}
        />
      )}
    </div>
  );
}
