import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Zap, 
  ArrowLeft,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Building,
  DollarSign,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { mt5ClientService } from '@/services/mt5ClientService';
import { MT5_POPULAR_BROKERS, MT5BrokerEntry, detectBrokerFromServer } from '@/lib/mt5BrokerDirectory';
import { MT5AccountCredentials, ConnectedTradingAccount, MT5SyncResult } from '@/types/mt5';
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
  const { activeDashboard } = useAuth();
  const effectiveDashboardId = targetDashboardId || activeDashboard?.id || 'default';

  // Navigation tab: 'connect' | 'create'
  const [activeTab, setActiveTab] = useState<'connect' | 'create'>(initialTab);

  // TAB 1: Connect Existing Form - ONLY 3 REQUIRED FIELDS as requested
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [server, setServer] = useState('');
  const [serverSearchQuery, setServerSearchQuery] = useState('');
  const [showServerDropdown, setShowServerDropdown] = useState(false);

  // TAB 2: Create Account Form
  const [createMode, setCreateMode] = useState<'demo' | 'live'>('demo');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('sharkfunded');
  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [demoLeverage, setDemoLeverage] = useState<number>(100);
  const [demoCurrency, setDemoCurrency] = useState<string>('USD');
  const [isProvisioningDemo, setIsProvisioningDemo] = useState(false);
  const [provisionedAccount, setProvisionedAccount] = useState<{
    loginId: string;
    investorPassword: string;
    masterPassword?: string;
    server: string;
    brokerName: string;
    balance: number;
    currency: string;
    leverage: number;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Status & Progress
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncProgressStep, setSyncProgressStep] = useState<string>('Connecting...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<ConnectedTradingAccount | null>(null);
  const [syncResult, setSyncResult] = useState<MT5SyncResult | null>(null);
  const [positionsAccount, setPositionsAccount] = useState<ConnectedTradingAccount | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage(null);
      setConnectedAccount(null);
      setSyncResult(null);
      setProvisionedAccount(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Known servers suggestion list
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

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // TAB 1: Handle Connect Existing MT5 Account
  const handleConnect = async (customCreds?: { loginId: string; pass: string; srv: string }) => {
    const targetLogin = (customCreds ? customCreds.loginId : loginId).trim();
    const targetPass = (customCreds ? customCreds.pass : password).trim();
    const targetServer = (customCreds ? customCreds.srv : server).trim();

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
    setSyncProgressStep('Connecting to MT5 broker terminal bridge...');

    try {
      await new Promise(r => setTimeout(r, 400));
      setSyncProgressStep('Validating credentials with broker server...');

      const detected = detectBrokerFromServer(targetServer);

      const credentials: MT5AccountCredentials = {
        broker: detected.broker,
        server: targetServer,
        accountNumber: targetLogin,
        investorPassword: targetPass,
        connectionType: detected.connectionType,
        readOnly: true,
        label: `${detected.broker} (${detected.connectionType.toUpperCase()})`
      };

      const { account } = await mt5ClientService.connectAccount(credentials, effectiveDashboardId);

      setSyncProgressStep('Importing historical trade executions...');
      const syncRes = await mt5ClientService.syncTrades(account.id, effectiveDashboardId, 30);

      setConnectedAccount(account);
      setSyncResult(syncRes);
      if (onSuccess) onSuccess(account);
    } catch (err: any) {
      const msg = err?.message || 'MT5 connection failed';
      setErrorMessage(msg.startsWith('MT5 connection failed') ? msg : `MT5 connection failed: ${msg}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // TAB 2: Handle Provision Demo Account
  const handleProvisionDemo = async () => {
    setIsProvisioningDemo(true);
    setErrorMessage(null);

    try {
      const res = await mt5ClientService.createDemoAccount({
        brokerId: selectedBrokerId,
        balance: demoBalance,
        leverage: demoLeverage,
        currency: demoCurrency
      });

      setProvisionedAccount(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create demo MT5 account.');
    } finally {
      setIsProvisioningDemo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* If successfully connected, show the celebratory experience! */}
        {connectedAccount ? (
          <SuccessCelebration
            account={connectedAccount}
            syncResult={syncResult}
            onGoToDashboard={() => {
              onClose();
            }}
            onViewPositions={() => {
              setPositionsAccount(connectedAccount);
            }}
            onConnectAnother={() => {
              setConnectedAccount(null);
              setSyncResult(null);
              setLoginId('');
              setPassword('');
              setServer('');
              setProvisionedAccount(null);
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
                      Read-Only Bridge
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Connect existing trading accounts or open a new MT5 account
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose} 
                disabled={isConnecting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR: TAB 1 vs TAB 2 */}
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
                  <Plus className="w-4 h-4" />
                  <span>Create MT5 Account</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-[11px] text-rose-300/80">
                    Verify that your MT5 account number, investor password, and server match your MetaTrader 5 terminal login details.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {isConnecting ? (
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
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Contacting MT5 server {server}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      <span>Checking investor password permissions...</span>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'connect' ? (
                /* ============================================== */
                /* TAB 1: CONNECT EXISTING MT5 (ONLY 3 FIELDS)     */
                /* ============================================== */
                <div className="space-y-4">
                  {/* FIELD 1: Login ID */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      MT5 Login ID
                    </label>
                    <input
                      type="text"
                      value={loginId}
                      onChange={e => setLoginId(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 5182901"
                      maxLength={12}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Your numeric MetaTrader 5 account number</p>
                  </div>

                  {/* FIELD 2: MT5 Password (with eye toggle) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        MT5 Password
                      </label>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Investor Password Preferred
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your MT5 password (Investor or Master)"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-slate-500">
                        Read-only investor password grants TradeVault sync access without trade execution permissions.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium shrink-0 ml-2"
                      >
                        {showPassword ? 'Hide Password' : 'Show Password'}
                      </button>
                    </div>
                  </div>

                  {/* FIELD 3: MT5 Server */}
                  <div className="relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      MT5 Server
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={server}
                        onChange={e => {
                          setServer(e.target.value);
                          setServerSearchQuery(e.target.value);
                          setShowServerDropdown(true);
                        }}
                        onFocus={() => setShowServerDropdown(true)}
                        placeholder="e.g. SharkFunded-Live, ICMarketsSC-Live01, FTMO-Server"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 pr-8 text-sm text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Server className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Server Suggestions Dropdown */}
                    {showServerDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-52 overflow-y-auto z-40 p-1.5 divide-y divide-slate-800/60">
                        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Quick Select Popular Broker Servers (or type any custom server):
                        </div>
                        {filteredServers.slice(0, 10).map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setServer(item.server);
                              setShowServerDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <span className="font-mono font-bold text-slate-200">{item.server}</span>
                              <span className="text-[11px] text-slate-400 block">{item.broker}</span>
                            </div>
                            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                              item.type === 'live' 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Broker-agnostic. Enter any supported Live or Demo MT5 server name.
                    </p>
                  </div>

                  {/* Read-Only Safety Information */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      TradeVault uses this connection to import trading data into your journal. TradeVault does not place or modify trades.
                    </p>
                  </div>

                  {/* Connect MT5 Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleConnect()}
                      disabled={!loginId || !password || !server || isConnecting}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Connect MT5</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* ============================================== */
                /* TAB 2: CREATE NEW MT5 ACCOUNT                  */
                /* ============================================== */
                <div className="space-y-5">
                  {/* Sub-modes: Demo vs Live */}
                  <div className="flex items-center gap-2 p-1 bg-slate-950/60 border border-slate-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMode('demo');
                        setProvisionedAccount(null);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        createMode === 'demo'
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Instant Demo MT5 Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMode('live');
                        setProvisionedAccount(null);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        createMode === 'live'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Open Live / Prop Challenge
                    </button>
                  </div>

                  {createMode === 'demo' ? (
                    <div className="space-y-4">
                      {provisionedAccount ? (
                        /* Provisioned Demo Account Result Card */
                        <div className="space-y-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 text-left animate-in zoom-in-95 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <h4 className="text-sm font-bold text-slate-100">
                                MT5 Demo Account Ready!
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                              Simulated Practice
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Broker & Server</span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-slate-200">{provisionedAccount.server}</span>
                                <button 
                                  onClick={() => handleCopy(provisionedAccount.server, 'server')}
                                  className="text-slate-400 hover:text-slate-200 p-1"
                                >
                                  {copiedField === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Login ID / Account #</span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-blue-400 text-sm">{provisionedAccount.loginId}</span>
                                <button 
                                  onClick={() => handleCopy(provisionedAccount.loginId, 'login')}
                                  className="text-slate-400 hover:text-slate-200 p-1"
                                >
                                  {copiedField === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Investor (Read-Only) Password</span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-emerald-400">{provisionedAccount.investorPassword}</span>
                                <button 
                                  onClick={() => handleCopy(provisionedAccount.investorPassword, 'investor')}
                                  className="text-slate-400 hover:text-slate-200 p-1"
                                >
                                  {copiedField === 'investor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Master Password</span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-slate-300">{provisionedAccount.masterPassword}</span>
                                <button 
                                  onClick={() => handleCopy(provisionedAccount.masterPassword || '', 'master')}
                                  className="text-slate-400 hover:text-slate-200 p-1"
                                >
                                  {copiedField === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Instant 1-Click Connect to TradeVault Button */}
                          <div className="pt-2">
                            <Button
                              onClick={() => {
                                handleConnect({
                                  loginId: provisionedAccount.loginId,
                                  pass: provisionedAccount.investorPassword,
                                  srv: provisionedAccount.server
                                });
                              }}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                            >
                              <Zap className="w-4 h-4" />
                              <span>Connect to TradeVault</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Demo Account Options Form */
                        <div className="space-y-4 text-left">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                              Select Broker
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {MT5_POPULAR_BROKERS.slice(0, 6).map(broker => (
                                <button
                                  key={broker.id}
                                  type="button"
                                  onClick={() => setSelectedBrokerId(broker.id)}
                                  className={`p-3 rounded-xl border text-left transition-all ${
                                    selectedBrokerId === broker.id
                                      ? 'bg-blue-600/20 text-blue-400 border-blue-500 shadow-xs'
                                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="text-xs font-bold block">{broker.name}</span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    {broker.category === 'prop' ? 'Prop Firm' : 'CFD Broker'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Starting Balance
                              </label>
                              <select
                                value={demoBalance}
                                onChange={e => setDemoBalance(Number(e.target.value))}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value={10000}>$10,000 USD</option>
                                <option value={25000}>$25,000 USD</option>
                                <option value={50000}>$50,000 USD</option>
                                <option value={100000}>$100,000 USD</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Leverage
                              </label>
                              <select
                                value={demoLeverage}
                                onChange={e => setDemoLeverage(Number(e.target.value))}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value={30}>1:30</option>
                                <option value={100}>1:100</option>
                                <option value={200}>1:200</option>
                                <option value={500}>1:500</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Currency
                              </label>
                              <select
                                value={demoCurrency}
                                onChange={e => setDemoCurrency(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              onClick={handleProvisionDemo}
                              disabled={isProvisioningDemo}
                              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{isProvisioningDemo ? 'Provisioning...' : 'Provision Demo MT5 Account'}</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Live / Prop Challenge Broker Catalog & Guides */
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 text-left">
                      <p className="text-xs text-slate-400">
                        Create an account directly with official brokers and prop firms. Once you receive your MT5 credentials via email, connect them using Tab 1:
                      </p>

                      {MT5_POPULAR_BROKERS.map(broker => (
                        <div
                          key={broker.id}
                          className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-100">{broker.name}</h4>
                              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                                broker.category === 'prop'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {broker.category === 'prop' ? 'Prop Firm' : 'Broker'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Standard Servers: {broker.servers.slice(0, 2).map(s => s.name).join(', ')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={broker.liveAccountUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <span>Official Site</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setServer(broker.servers[0]?.name || '');
                                setActiveTab('connect');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-semibold transition-colors"
                            >
                              Connect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Open Positions Modal if requested */}
      <MT5OpenPositionsModal
        account={positionsAccount}
        onClose={() => setPositionsAccount(null)}
      />
    </div>
  );
}
