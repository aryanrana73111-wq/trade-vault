import React, { useState, useEffect } from 'react';
import { getAllMarketOptions, addCustomMarket, MarketOption } from '@/lib/customMarkets';
import { Plus, X, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MarketSelectorProps {
  value: string;
  onChange: (market: string) => void;
  userId?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function MarketSelector({
  value,
  onChange,
  userId,
  required = true,
  className = '',
  disabled = false,
  label = 'Market / Instrument'
}: MarketSelectorProps) {
  const [options, setOptions] = useState<MarketOption[]>(() => getAllMarketOptions(userId));
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customMarketInput, setCustomMarketInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync with storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setOptions(getAllMarketOptions(userId));
    };
    window.addEventListener('tradevault_custom_markets_updated', handleUpdate);
    return () => window.removeEventListener('tradevault_custom_markets_updated', handleUpdate);
  }, [userId]);

  // Ensure current value is in options if not already
  useEffect(() => {
    if (value && !options.some(o => o.value.toLowerCase() === value.toLowerCase())) {
      setOptions(prev => [...prev, { value, label: `${value} (Custom)`, isCustom: true }]);
    }
  }, [value, options]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__ADD_NEW__') {
      setIsAddingCustom(true);
      setCustomMarketInput('');
      setError(null);
    } else {
      onChange(selected);
    }
  };

  const handleAddCustomMarket = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customMarketInput.trim();
    if (!trimmed) {
      setError('Please enter a market or instrument name.');
      return;
    }

    const updatedList = addCustomMarket(trimmed, userId);
    setOptions(getAllMarketOptions(userId));
    onChange(trimmed);
    setIsAddingCustom(false);
    setCustomMarketInput('');
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {!isAddingCustom && !disabled && (
          <button
            type="button"
            onClick={() => {
              setIsAddingCustom(true);
              setCustomMarketInput('');
              setError(null);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Market
          </button>
        )}
      </div>

      {!isAddingCustom ? (
        <select
          value={value}
          onChange={handleSelectChange}
          required={required}
          disabled={disabled}
          className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="" disabled>Select a market...</option>
          <optgroup label="Standard Markets">
            {options
              .filter(o => !o.isCustom)
              .map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
          </optgroup>
          {options.some(o => o.isCustom) && (
            <optgroup label="Custom Instruments">
              {options
                .filter(o => o.isCustom)
                .map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
            </optgroup>
          )}
          <option value="__ADD_NEW__" className="font-semibold text-indigo-600 dark:text-indigo-400">
            + Add Custom Market...
          </option>
        </select>
      ) : (
        <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 space-y-2 animate-in fade-in duration-150">
          <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
            Enter Market / Instrument Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={customMarketInput}
              onChange={e => {
                setCustomMarketInput(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomMarket();
                } else if (e.key === 'Escape') {
                  setIsAddingCustom(false);
                }
              }}
              placeholder="e.g. US30, NAS100, NIFTY50, BANKNIFTY, AAPL, WTI..."
              className="flex-1 h-10 px-3 text-xs sm:text-sm rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddCustomMarket()}
              className="h-10 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Add Market
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingCustom(false);
                setError(null);
              }}
              className="h-10 px-2.5 text-slate-600 dark:text-slate-300 text-xs shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {error && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Supports any Forex pair, Index (US30, NAS100, DAX), Crypto, Commodity (Gold, Oil), Stock, or custom ticker.
          </p>
        </div>
      )}
    </div>
  );
}
