import React, { useState } from 'react';
import { InstrumentSpecification, AssetClass } from '@/types';
import { DEFAULT_INSTRUMENTS, createCustomInstrument } from '@/lib/riskCalculator';
import { Search, Plus, Check, SlidersHorizontal } from 'lucide-react';

interface InstrumentSelectorProps {
  selected: InstrumentSpecification;
  onSelect: (instrument: InstrumentSpecification) => void;
  onOpenAdvanced: () => void;
}

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selected,
  onSelect,
  onOpenAdvanced
}) => {
  const [activeTab, setActiveTab] = useState<AssetClass | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredInstruments = DEFAULT_INSTRUMENTS.filter((inst) => {
    const matchesTab = activeTab === 'ALL' || inst.assetClass === activeTab;
    const matchesSearch = 
      inst.symbol.toLowerCase().includes(search.toLowerCase()) ||
      inst.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymbol.trim()) return;
    const cleanSym = customSymbol.trim().toUpperCase();
    const isCrypto = cleanSym.includes('BTC') || cleanSym.includes('ETH') || cleanSym.includes('SOL');
    const isMetal = cleanSym.includes('XAU') || cleanSym.includes('XAG');
    const assetClass: AssetClass = isMetal ? 'METALS' : (isCrypto ? 'CRYPTO' : 'FOREX');
    const newCustom = createCustomInstrument(cleanSym, assetClass);
    onSelect(newCustom);
    setShowCustomInput(false);
    setCustomSymbol('');
  };

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-xs font-medium">
        {(['ALL', 'FOREX', 'METALS', 'CRYPTO'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
            selected.isCustom
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {/* Custom Instrument Input Popup/Bar */}
      {showCustomInput && (
        <form onSubmit={handleCreateCustom} className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
          <input
            type="text"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value)}
            placeholder="e.g. US30/USD, NAS100, WTI/USD"
            className="flex-1 h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
          >
            Add Instrument
          </button>
        </form>
      )}

      {/* Quick Search & Current selection pill */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter symbols (EUR/USD, Gold, BTC...)"
            className="w-full h-9 pl-8 pr-3 text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onOpenAdvanced}
          className="h-9 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          title="Configure broker specifications for this instrument"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Specs</span>
        </button>
      </div>

      {/* Chips of instruments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
        {filteredInstruments.map((inst) => {
          const isSelected = selected.symbol === inst.symbol && !selected.isCustom;
          return (
            <button
              key={inst.symbol}
              type="button"
              onClick={() => onSelect(inst)}
              className={`flex items-center justify-between p-2 rounded-lg text-left transition-all border text-xs cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-100 font-semibold shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="truncate min-w-0 pr-1">
                <span className="block font-medium tracking-tight truncate">{inst.symbol}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">{inst.name}</span>
              </div>
              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Instrument Summary Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-100">{selected.symbol}</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-semibold uppercase">
            {selected.assetClass}
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">•</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline">
            Contract: {selected.contractSize.toLocaleString()} {selected.assetClass === 'METALS' ? 'oz' : (selected.assetClass === 'FOREX' ? selected.baseCurrency : 'units')}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenAdvanced}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs flex items-center gap-1 cursor-pointer"
        >
          Edit Specs
        </button>
      </div>
    </div>
  );
};
