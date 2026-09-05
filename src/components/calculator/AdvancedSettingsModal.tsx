import React, { useState } from 'react';
import { InstrumentSpecification, ContractType } from '@/types';
import { Card, Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X, Sliders, Info, RotateCcw } from 'lucide-react';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  specification: InstrumentSpecification;
  onSave: (updated: InstrumentSpecification, quoteRate?: number, leverage?: number) => void;
  currentQuoteRate?: number;
  currentLeverage?: number;
  accountCurrency: string;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  specification,
  onSave,
  currentQuoteRate = 1,
  currentLeverage = 100,
  accountCurrency
}) => {
  const [contractSize, setContractSize] = useState(specification.contractSize.toString());
  const [pipSize, setPipSize] = useState(specification.pipSize.toString());
  const [minPositionSize, setMinPositionSize] = useState(specification.minPositionSize.toString());
  const [positionStep, setPositionStep] = useState(specification.positionStep.toString());
  const [contractType, setContractType] = useState<ContractType>(specification.contractType);
  const [unitName, setUnitName] = useState(specification.unitName);
  const [quoteRate, setQuoteRate] = useState(currentQuoteRate.toString());
  const [leverage, setLeverage] = useState(currentLeverage.toString());

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: InstrumentSpecification = {
      ...specification,
      contractSize: parseFloat(contractSize) || specification.contractSize,
      pipSize: parseFloat(pipSize) || specification.pipSize,
      minPositionSize: parseFloat(minPositionSize) || specification.minPositionSize,
      positionStep: parseFloat(positionStep) || specification.positionStep,
      contractType,
      unitName: unitName.trim() || specification.unitName,
      isCustom: true,
    };
    onSave(updated, parseFloat(quoteRate) || 1, parseFloat(leverage) || undefined);
    onClose();
  };

  const handleResetDefaults = () => {
    setContractSize(specification.contractSize.toString());
    setPipSize(specification.pipSize.toString());
    setMinPositionSize(specification.minPositionSize.toString());
    setPositionStep(specification.positionStep.toString());
    setContractType(specification.contractType);
    setUnitName(specification.unitName);
    setQuoteRate('1');
    setLeverage('100');
  };

  const needsConversion = specification.quoteCurrency !== accountCurrency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-lg">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Broker Specification: {specification.symbol}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Different brokers and exchanges use differing contract specifications. Adjust these settings to match your specific broker account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractSize" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contract Size
              </Label>
              <Input
                id="contractSize"
                type="number"
                step="any"
                min="0.0001"
                value={contractSize}
                onChange={(e) => setContractSize(e.target.value)}
                className="h-10 text-sm"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {specification.assetClass === 'FOREX' ? '100,000 for standard lot' : (specification.assetClass === 'METALS' ? '100 oz for Gold, 5000 oz Silver' : 'Units per contract')}
              </span>
            </div>

            <div>
              <Label htmlFor="pipSize" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Pip / Tick Size
              </Label>
              <Input
                id="pipSize"
                type="number"
                step="any"
                min="0.0000001"
                value={pipSize}
                onChange={(e) => setPipSize(e.target.value)}
                className="h-10 text-sm"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                e.g. 0.0001 (standard forex), 0.01 (JPY/Gold), 1.0 (Crypto)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPositionSize" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Minimum Position Size
              </Label>
              <Input
                id="minPositionSize"
                type="number"
                step="any"
                min="0.00001"
                value={minPositionSize}
                onChange={(e) => setMinPositionSize(e.target.value)}
                className="h-10 text-sm"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                e.g. 0.01 lot (micro) or 0.0001 BTC
              </span>
            </div>

            <div>
              <Label htmlFor="positionStep" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Position Size Step
              </Label>
              <Input
                id="positionStep"
                type="number"
                step="any"
                min="0.00001"
                value={positionStep}
                onChange={(e) => setPositionStep(e.target.value)}
                className="h-10 text-sm"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                e.g. 0.01 lot increment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractType" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contract Type
              </Label>
              <select
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Spot">Spot (Coins / Units)</option>
                <option value="CFD">CFD (Contract for Difference)</option>
                <option value="Futures">Futures</option>
                <option value="Perpetual">Perpetual Swap</option>
              </select>
            </div>

            <div>
              <Label htmlFor="unitName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Display Unit Label
              </Label>
              <Input
                id="unitName"
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="lots, oz, BTC, contracts"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Currency conversion and leverage */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account Currency & Leverage
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leverage" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Account Leverage (1:X)
                </Label>
                <Input
                  id="leverage"
                  type="number"
                  min="1"
                  max="2000"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="h-10 text-sm"
                  placeholder="e.g. 100 for 1:100"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Used exclusively for margin estimate
                </span>
              </div>

              {needsConversion && (
                <div>
                  <Label htmlFor="quoteRate" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Exchange Rate ({specification.quoteCurrency} → {accountCurrency})
                  </Label>
                  <Input
                    id="quoteRate"
                    type="number"
                    step="any"
                    min="0.000001"
                    value={quoteRate}
                    onChange={(e) => setQuoteRate(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Converts {specification.quoteCurrency} quote pip values to {accountCurrency}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 px-4">
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                Save Specifications
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
