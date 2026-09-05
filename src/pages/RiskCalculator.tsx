import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSettings } from '@/lib/settings';
import { 
  CalculatorInput, 
  Direction, 
  InstrumentSpecification, 
  CalculatorHistoryItem 
} from '@/types';
import { 
  DEFAULT_INSTRUMENTS, 
  calculatePositionSize, 
  RISK_PRESETS 
} from '@/lib/riskCalculator';
import { 
  saveCalculatorHistoryItem, 
  deleteCalculatorHistoryItem, 
  subscribeToCalculatorHistory 
} from '@/lib/calculatorHistory';
import { InstrumentSelector } from '@/components/calculator/InstrumentSelector';
import { ResultsPanel } from '@/components/calculator/ResultsPanel';
import { RiskScenariosTable } from '@/components/calculator/RiskScenariosTable';
import { CalculationHistoryTab } from '@/components/calculator/CalculationHistoryTab';
import { AdvancedSettingsModal } from '@/components/calculator/AdvancedSettingsModal';
import { Input, Label } from '@/components/ui/Input';
import { 
  Calculator, 
  Sliders, 
  Table, 
  History, 
  ShieldCheck, 
  RotateCcw, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react';

export default function RiskCalculator() {
  const navigate = useNavigate();
  const { user, activeDashboard } = useAuth();
  const settings = useMemo(() => getSettings(), []);

  // Settings & Risk limits
  const maxConfiguredRisk = settings.risk.maxDailyRisk || settings.risk.defaultRisk || 2;
  const defaultAccountRisk = settings.risk.defaultRisk || 1.0;

  // Active dashboard info or fallbacks
  const dashboardBalance = activeDashboard?.startingBalance || 10000;
  const dashboardCurrency = activeDashboard?.currency || 'USD';

  // Calculator Form State
  const [accountBalance, setAccountBalance] = useState<number>(dashboardBalance);
  const [accountCurrency, setAccountCurrency] = useState<string>(dashboardCurrency);
  const [riskMode, setRiskMode] = useState<'percent' | 'amount'>('percent');
  const [riskPercent, setRiskPercent] = useState<string>(defaultAccountRisk.toString());
  const [riskAmount, setRiskAmount] = useState<string>((dashboardBalance * (defaultAccountRisk / 100)).toString());

  const [instrument, setInstrument] = useState<InstrumentSpecification>(DEFAULT_INSTRUMENTS[0]); // EUR/USD
  const [direction, setDirection] = useState<Direction>('BUY');
  const [entryPrice, setEntryPrice] = useState<string>('1.08500');
  const [stopLossPrice, setStopLossPrice] = useState<string>('1.08200');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('1.09200');
  const [leverage, setLeverage] = useState<string>('100');
  const [quoteRate, setQuoteRate] = useState<number>(1);

  // Tabs & Modal
  const [activeTab, setActiveTab] = useState<'calculator' | 'scenarios' | 'history'>('calculator');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [history, setHistory] = useState<CalculatorHistoryItem[]>([]);
  const [isSavingHistory, setIsSavingHistory] = useState(false);

  // Synchronize with active dashboard when it loads/changes
  useEffect(() => {
    if (activeDashboard) {
      setAccountBalance(activeDashboard.startingBalance || 10000);
      setAccountCurrency(activeDashboard.currency || 'USD');
      // Recalculate risk amount based on current percent
      const pct = parseFloat(riskPercent) || 1;
      setRiskAmount(((activeDashboard.startingBalance || 10000) * (pct / 100)).toFixed(2));
    }
  }, [activeDashboard?.id]);

  // Subscribe to calculation history
  useEffect(() => {
    if (!user || !activeDashboard) return;
    const unsub = subscribeToCalculatorHistory(user.uid, activeDashboard.id, (items) => {
      setHistory(items);
    });
    return () => unsub();
  }, [user?.uid, activeDashboard?.id]);

  // Bi-directional Risk % and Risk Amount handlers
  const handleRiskPercentChange = (val: string) => {
    setRiskPercent(val);
    setRiskMode('percent');
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && accountBalance > 0) {
      const calculatedAmt = (accountBalance * (parsed / 100));
      setRiskAmount(calculatedAmt.toFixed(2));
    }
  };

  const handleRiskAmountChange = (val: string) => {
    setRiskAmount(val);
    setRiskMode('amount');
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && accountBalance > 0) {
      const calculatedPct = (parsed / accountBalance) * 100;
      setRiskPercent(calculatedPct.toFixed(2));
    }
  };

  const handleApplyPreset = (preset: number) => {
    handleRiskPercentChange(preset.toString());
  };

  const handleResetBalance = () => {
    const bal = activeDashboard?.startingBalance || 10000;
    setAccountBalance(bal);
    const pct = parseFloat(riskPercent) || 1;
    setRiskAmount(((bal * pct) / 100).toFixed(2));
  };

  // Build Calculator Input
  const calculatorInput: CalculatorInput = useMemo(() => {
    const parsedEntry = parseFloat(entryPrice) || 0;
    const parsedSL = parseFloat(stopLossPrice) || 0;
    const parsedTP = parseFloat(takeProfitPrice) || undefined;
    const parsedLev = parseFloat(leverage) || undefined;
    const parsedRiskPct = parseFloat(riskPercent) || 0;
    const parsedRiskAmt = parseFloat(riskAmount) || 0;

    return {
      accountBalance,
      accountCurrency,
      riskPercent: parsedRiskPct,
      riskAmount: parsedRiskAmt,
      riskMode,
      symbol: instrument.symbol,
      direction,
      entry: parsedEntry,
      stopLoss: parsedSL,
      takeProfit: parsedTP,
      leverage: parsedLev,
      quoteToAccountRate: quoteRate,
      specification: instrument
    };
  }, [
    accountBalance,
    accountCurrency,
    riskPercent,
    riskAmount,
    riskMode,
    instrument,
    direction,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    leverage,
    quoteRate
  ]);

  // Run Calculation
  const calculationResult = useMemo(() => {
    return calculatePositionSize(calculatorInput, maxConfiguredRisk);
  }, [calculatorInput, maxConfiguredRisk]);

  // "Use in Add Trade" Action
  const handleUseInAddTrade = (itemToUse?: CalculatorHistoryItem) => {
    if (itemToUse) {
      navigate('/trades/add', {
        state: {
          prefill: {
            market: itemToUse.instrument,
            direction: itemToUse.direction,
            entry: itemToUse.entry.toString(),
            stopLoss: itemToUse.stopLoss.toString(),
            takeProfit: itemToUse.takeProfit ? itemToUse.takeProfit.toString() : '',
            positionSize: itemToUse.positionSize.toString(),
            risk: itemToUse.riskAmount.toString(),
            riskPercent: itemToUse.riskPercent.toString()
          }
        }
      });
      return;
    }

    if (!calculationResult.isValid || calculationResult.roundedPositionSize <= 0) return;

    navigate('/trades/add', {
      state: {
        prefill: {
          market: instrument.symbol,
          direction,
          entry: entryPrice,
          stopLoss: stopLossPrice,
          takeProfit: takeProfitPrice,
          positionSize: calculationResult.roundedPositionSize.toString(),
          risk: calculationResult.estimatedLoss.toString(),
          riskPercent: calculationResult.actualRiskPercent.toString()
        }
      }
    });
  };

  // "Save Calculation" Action
  const handleSaveCalculation = async () => {
    if (!calculationResult.isValid || calculationResult.roundedPositionSize <= 0) return;
    if (!user || !activeDashboard) return;

    try {
      setIsSavingHistory(true);
      await saveCalculatorHistoryItem(user.uid, activeDashboard.id, {
        timestamp: Date.now(),
        instrument: instrument.symbol,
        assetClass: instrument.assetClass,
        direction,
        accountBalance,
        currency: accountCurrency,
        riskPercent: calculationResult.actualRiskPercent,
        riskAmount: calculationResult.estimatedLoss,
        entry: parseFloat(entryPrice) || 0,
        stopLoss: parseFloat(stopLossPrice) || 0,
        takeProfit: parseFloat(takeProfitPrice) || undefined,
        positionSize: calculationResult.roundedPositionSize,
        unitLabel: calculationResult.unitLabel,
        units: calculationResult.equivalentUnits,
        contractSize: instrument.contractSize,
        riskRewardRatio: calculationResult.riskRewardRatio,
        estimatedLoss: calculationResult.estimatedLoss,
        potentialProfit: calculationResult.potentialProfit,
        notionalValue: calculationResult.notionalValue
      });
    } catch (e) {
      console.error('Failed to save calculation snapshot:', e);
    } finally {
      setIsSavingHistory(false);
    }
  };

  // Load a historical calculation snapshot back into the active calculator
  const handleLoadHistoryItem = (item: CalculatorHistoryItem) => {
    // Find matching instrument or build one
    const existing = DEFAULT_INSTRUMENTS.find(i => i.symbol === item.instrument);
    if (existing) {
      setInstrument(existing);
    } else {
      setInstrument({
        symbol: item.instrument,
        name: item.instrument,
        assetClass: item.assetClass,
        contractSize: item.contractSize || 100000,
        pipSize: item.assetClass === 'FOREX' ? 0.0001 : 0.01,
        baseCurrency: item.instrument.split('/')[0] || 'BASE',
        quoteCurrency: item.instrument.split('/')[1] || 'USD',
        unitName: item.unitLabel || 'lots',
        contractType: 'CFD',
        minPositionSize: 0.01,
        positionStep: 0.01,
        isCustom: true
      });
    }

    setDirection(item.direction);
    setEntryPrice(item.entry.toString());
    setStopLossPrice(item.stopLoss.toString());
    setTakeProfitPrice(item.takeProfit ? item.takeProfit.toString() : '');
    setAccountBalance(item.accountBalance || accountBalance);
    setAccountCurrency(item.currency || accountCurrency);
    setRiskPercent(item.riskPercent.toString());
    setRiskAmount(item.riskAmount.toString());
    setRiskMode('percent');
    setActiveTab('calculator');
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!user || !activeDashboard) return;
    await deleteCalculatorHistoryItem(user.uid, activeDashboard.id, id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Context Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Risk & Position Sizing Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Professional precision position sizing tailored for Forex, Gold & Metals, and Crypto.
          </p>
        </div>

        {/* Active Account / Balance Pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 px-4 shadow-sm self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Active Dashboard Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                {accountCurrency} {accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {activeDashboard?.name || 'Default'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetBalance}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset balance to active dashboard starting balance"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Position Sizer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'scenarios'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Risk Scenario Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Saved History</span>
          {history.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Primary Position Size Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Trade Setup Controls */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Trade Parameters</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAdvancedModalOpen(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Broker Specs</span>
              </button>
            </div>

            {/* Instrument Selection */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Market / Instrument
              </Label>
              <InstrumentSelector
                selected={instrument}
                onSelect={(inst) => setInstrument(inst)}
                onOpenAdvanced={() => setIsAdvancedModalOpen(true)}
              />
            </div>

            {/* Direction Toggle */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Trade Direction
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    direction === 'BUY'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>BUY (Long)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    direction === 'SELL'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>SELL (Short)</span>
                </button>
              </div>
            </div>

            {/* Account Balance & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <Label htmlFor="accountBalance" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Balance
                </Label>
                <div className="relative">
                  <Input
                    id="accountBalance"
                    type="number"
                    min="1"
                    step="any"
                    value={accountBalance}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setAccountBalance(val);
                      if (riskMode === 'percent') {
                        const pct = parseFloat(riskPercent) || 0;
                        setRiskAmount(((val * pct) / 100).toFixed(2));
                      }
                    }}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accountCurrency" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Currency
                </Label>
                <select
                  id="accountCurrency"
                  value={accountCurrency}
                  onChange={(e) => setAccountCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CHF">CHF (₣)</option>
                </select>
              </div>
            </div>

            {/* Risk Section with Bi-directional sync */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Planned Risk per Trade
                </Label>
                <span className="text-[11px] text-slate-400">
                  Max guardrail: {maxConfiguredRisk}%
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                {RISK_PRESETS.map((preset) => {
                  const isSelected = Math.abs(parseFloat(riskPercent) - preset) < 0.001;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>

              {/* Bi-directional Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-blue-500" />
                      Risk Percentage
                    </span>
                    {riskMode === 'percent' && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Driver</span>
                    )}
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    value={riskPercent}
                    onChange={(e) => handleRiskPercentChange(e.target.value)}
                    className="h-10 text-sm font-mono"
                    placeholder="e.g. 1.0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      Risk Amount ({accountCurrency})
                    </span>
                    {riskMode === 'amount' && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Driver</span>
                    )}
                  </div>
                  <Input
                    type="number"
                    step="any"
                    min="0.01"
                    value={riskAmount}
                    onChange={(e) => handleRiskAmountChange(e.target.value)}
                    className="h-10 text-sm font-mono"
                    placeholder="e.g. 100.00"
                  />
                </div>
              </div>
            </div>

            {/* Price Levels: Entry, Stop Loss, Take Profit */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Execution Price Levels
                </Label>
                <span className="text-[11px] text-slate-400">
                  {direction === 'BUY' ? 'Buy: SL < Entry < TP' : 'Sell: TP < Entry < SL'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="entryPrice" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Entry Price *
                  </Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="any"
                    min="0.0000001"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="h-10 text-sm font-mono font-bold"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="stopLossPrice" className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                    Stop Loss *
                  </Label>
                  <Input
                    id="stopLossPrice"
                    type="number"
                    step="any"
                    min="0.0000001"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    className="h-10 text-sm font-mono border-rose-300 dark:border-rose-900/70 focus:ring-rose-500 font-bold text-rose-600 dark:text-rose-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="takeProfitPrice" className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Take Profit
                    </Label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <Input
                    id="takeProfitPrice"
                    type="number"
                    step="any"
                    min="0.0000001"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    className="h-10 text-sm font-mono border-emerald-300 dark:border-emerald-900/70 focus:ring-emerald-500 font-bold text-emerald-600 dark:text-emerald-400"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Results Panel */}
          <div className="lg:col-span-6 xl:col-span-6">
            <ResultsPanel
              result={calculationResult}
              input={calculatorInput}
              onUseInAddTrade={() => handleUseInAddTrade()}
              onSaveCalculation={handleSaveCalculation}
              isSaving={isSavingHistory}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Risk Scenario Matrix */}
      {activeTab === 'scenarios' && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <RiskScenariosTable
            input={calculatorInput}
            onApplyScenario={(pct) => {
              handleRiskPercentChange(pct.toString());
              setActiveTab('calculator');
            }}
            maxConfiguredRisk={maxConfiguredRisk}
          />
        </div>
      )}

      {/* Tab 3: Calculation History */}
      {activeTab === 'history' && (
        <CalculationHistoryTab
          history={history}
          onLoadItem={handleLoadHistoryItem}
          onUseInAddTrade={(item) => handleUseInAddTrade(item)}
          onDeleteItem={handleDeleteHistoryItem}
        />
      )}

      {/* Advanced Settings Modal */}
      <AdvancedSettingsModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        specification={instrument}
        onSave={(updated, qRate, lev) => {
          setInstrument(updated);
          if (qRate !== undefined) setQuoteRate(qRate);
          if (lev !== undefined) setLeverage(lev.toString());
        }}
        currentQuoteRate={quoteRate}
        currentLeverage={parseFloat(leverage) || 100}
        accountCurrency={accountCurrency}
      />

      {/* Professional Disclaimers Footer */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
        <p className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
          <span>
            <strong>Broker & Execution Disclaimer:</strong> Risk calculations are estimates derived from standard instrument specifications and user-provided inputs. Actual trade fills, spreads, overnight swap rates, broker commissions, slippage, and dynamic margin requirements can alter live execution results. Always verify contract multipliers with your broker or exchange before placing live orders.
          </span>
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-5">
          TradeVault does not provide financial or investment advice. All calculations are intended for disciplined risk-management planning.
        </p>
      </div>
    </div>
  );
}
