import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Strategy, StrategyRule, Market, Session, Timeframe } from '@/types';
import { Card, Input, Label, Textarea, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Plus, X, ArrowLeft, GripVertical, Save, Sparkles, GraduationCap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function CreateStrategy() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveStrategy } = useData();

  const templateState = (location.state as any)?.strategyTemplate;
  
  const [formData, setFormData] = useState({
    name: templateState?.name || '',
    shortDescription: templateState?.shortDescription || '',
    detailedDescription: templateState?.detailedDescription || '',
    markets: (templateState?.markets || []) as string[],
    sessions: (templateState?.sessions || []) as string[],
    timeframes: (templateState?.timeframes || []) as string[],
    entryRules: (templateState?.entryRules || []) as StrategyRule[],
    invalidationRules: (templateState?.invalidationRules || []) as StrategyRule[],
    exitRules: {
      takeProfitLogic: templateState?.exitRules?.takeProfitLogic || '',
      stopLossLogic: templateState?.exitRules?.stopLossLogic || '',
      partialExitRules: templateState?.exitRules?.partialExitRules || '',
      trailingStopRules: templateState?.exitRules?.trailingStopRules || '',
      minimumRR: templateState?.exitRules?.minimumRR || '',
    },
    riskRules: {
      defaultRisk: templateState?.riskRules?.defaultRisk || '',
      maxRisk: templateState?.riskRules?.maxRisk || '',
      minRR: templateState?.riskRules?.minRR || '',
      maxTradesPerDay: templateState?.riskRules?.maxTradesPerDay || '',
    },
    checklist: (templateState?.checklist || []) as StrategyRule[],
    notes: templateState?.notes || '',
  });

  const [error, setError] = useState('');

  const toggleArrayItem = (field: 'markets' | 'sessions' | 'timeframes', item: string) => {
    setFormData(prev => {
      const arr = prev[field];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(x => x !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  const addRule = (field: 'entryRules' | 'invalidationRules' | 'checklist') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { id: uuidv4(), text: '' }]
    }));
  };

  const updateRule = (field: 'entryRules' | 'invalidationRules' | 'checklist', id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map(r => r.id === id ? { ...r, text } : r)
    }));
  };

  const removeRule = (field: 'entryRules' | 'invalidationRules' | 'checklist', id: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(r => r.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Strategy Name is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const newStrategy = await saveStrategy({
        name: formData.name,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        markets: formData.markets,
        sessions: formData.sessions,
        timeframes: formData.timeframes,
        entryRules: formData.entryRules.filter(r => r.text.trim()),
        invalidationRules: formData.invalidationRules.filter(r => r.text.trim()),
        exitRules: {
          takeProfitLogic: formData.exitRules.takeProfitLogic,
          stopLossLogic: formData.exitRules.stopLossLogic,
          partialExitRules: formData.exitRules.partialExitRules,
          trailingStopRules: formData.exitRules.trailingStopRules,
          minimumRR: parseFloat(formData.exitRules.minimumRR) || 0,
        },
        riskRules: {
          defaultRisk: parseFloat(formData.riskRules.defaultRisk) || 0,
          maxRisk: parseFloat(formData.riskRules.maxRisk) || 0,
          minRR: parseFloat(formData.riskRules.minRR) || 0,
          maxTradesPerDay: parseInt(formData.riskRules.maxTradesPerDay) || 0,
        },
        checklist: formData.checklist.filter(r => r.text.trim()),
        screenshots: {},
        status: 'Active',
        notes: formData.notes,
      });

      navigate(`/strategies/${newStrategy.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save strategy');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section: 'exitRules' | 'riskRules', name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [name]: value }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/strategies')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Strategy</h1>
          <p className="text-slate-500 mt-1">Define your rules, execution conditions, and risk parameters.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {templateState && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-bold text-blue-800 tracking-wider">
                Academy Template Loaded
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Pre-filled with institutional framework rules from TradeVault Academy. Review and customize before saving.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-200 text-blue-800 shrink-0">
            Academy Level 4
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Basic Information</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Strategy Name *</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. London Breakout, A+ Liquidity Sweep" required />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} placeholder="A brief one-sentence summary of the strategy." />
            </div>
            <div className="space-y-2">
              <Label>Detailed Description</Label>
              <Textarea 
                name="detailedDescription" 
                value={formData.detailedDescription} 
                onChange={handleInputChange} 
                className="min-h-[120px]" 
                placeholder="Describe the market setup, logic and idea behind this strategy. Why does this edge exist?"
              />
            </div>
          </div>
        </Card>

        {/* Markets, Sessions, Timeframes */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Trading Environment</h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label>Markets</Label>
              <div className="flex flex-wrap gap-2">
                {['XAU/USD', 'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'EUR/USD', 'GBP/USD', 'JPY/USD'].map(market => (
                  <button
                    key={market}
                    type="button"
                    onClick={() => toggleArrayItem('markets', market)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                      formData.markets.includes(market) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sessions</Label>
              <div className="flex flex-wrap gap-2">
                {['Asian', 'London', 'New York', 'Sydney'].map(session => (
                  <button
                    key={session}
                    type="button"
                    onClick={() => toggleArrayItem('sessions', session)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                      formData.sessions.includes(session) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {session}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Timeframes</Label>
              <div className="flex flex-wrap gap-2">
                {['1m', '3m', '5m', '15m', '30m', '1H', '4H', 'Daily'].map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => toggleArrayItem('timeframes', tf)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                      formData.timeframes.includes(tf) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Strategy Rules */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Strategy Rules</h3>
          
          <div className="space-y-8">
            {/* Entry Rules */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base text-slate-800">Entry Conditions</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addRule('entryRules')} className="h-8">
                  <Plus className="w-4 h-4 mr-1" /> Add Entry Rule
                </Button>
              </div>
              <div className="space-y-3">
                {formData.entryRules.map((rule, idx) => (
                  <div key={rule.id} className="flex items-start gap-3">
                    <div className="mt-2.5 text-slate-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <Input 
                        value={rule.text} 
                        onChange={(e) => updateRule('entryRules', rule.id, e.target.value)} 
                        placeholder={`e.g. ${idx === 0 ? 'Identify higher timeframe bias' : 'Wait for liquidity sweep'}`} 
                      />
                    </div>
                    <button type="button" onClick={() => removeRule('entryRules', rule.id)} className="mt-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {formData.entryRules.length === 0 && (
                  <div className="text-sm text-slate-500 italic py-2">No entry rules defined.</div>
                )}
              </div>
            </div>

            {/* Invalidation Rules */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base text-slate-800">Invalidation Conditions</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addRule('invalidationRules')} className="h-8">
                  <Plus className="w-4 h-4 mr-1" /> Add Rule
                </Button>
              </div>
              <div className="space-y-3">
                {formData.invalidationRules.map((rule, idx) => (
                  <div key={rule.id} className="flex items-start gap-3">
                    <div className="mt-2.5 text-slate-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <Input 
                        value={rule.text} 
                        onChange={(e) => updateRule('invalidationRules', rule.id, e.target.value)} 
                        placeholder="e.g. Structure breaks against the setup before entry" 
                      />
                    </div>
                    <button type="button" onClick={() => removeRule('invalidationRules', rule.id)} className="mt-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {formData.invalidationRules.length === 0 && (
                  <div className="text-sm text-slate-500 italic py-2">No invalidation conditions defined.</div>
                )}
              </div>
            </div>

            {/* Exit Rules */}
            <div className="pt-6 border-t border-slate-100">
              <Label className="text-base text-slate-800 block mb-4">Exit Rules</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Take Profit Logic</Label>
                  <Textarea value={formData.exitRules.takeProfitLogic} onChange={(e) => handleNestedChange('exitRules', 'takeProfitLogic', e.target.value)} placeholder="e.g. Next opposing liquidity pool" />
                </div>
                <div className="space-y-2">
                  <Label>Stop Loss Logic</Label>
                  <Textarea value={formData.exitRules.stopLossLogic} onChange={(e) => handleNestedChange('exitRules', 'stopLossLogic', e.target.value)} placeholder="e.g. Below the structural low of the sweep" />
                </div>
                <div className="space-y-2">
                  <Label>Partial Exit Rules</Label>
                  <Textarea value={formData.exitRules.partialExitRules} onChange={(e) => handleNestedChange('exitRules', 'partialExitRules', e.target.value)} placeholder="e.g. Take 50% off at 2R" />
                </div>
                <div className="space-y-2">
                  <Label>Trailing Stop Rules</Label>
                  <Textarea value={formData.exitRules.trailingStopRules} onChange={(e) => handleNestedChange('exitRules', 'trailingStopRules', e.target.value)} placeholder="e.g. Move SL to BE at 1.5R" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Pre-Trade Checklist */}
        <Card className="p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
            <h3 className="text-lg font-semibold text-slate-900">Pre-Trade Checklist</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => addRule('checklist')} className="h-8">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
          <p className="text-sm text-slate-500 mb-6">Create a checklist that you must verify before taking this trade. This will appear when you add a trade with this strategy.</p>
          
          <div className="space-y-3">
            {formData.checklist.map((rule, idx) => (
              <div key={rule.id} className="flex items-start gap-3">
                <div className="mt-2.5 text-slate-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="mt-3 w-4 h-4 border-2 border-slate-300 rounded shrink-0"></div>
                <div className="flex-1">
                  <Input 
                    value={rule.text} 
                    onChange={(e) => updateRule('checklist', rule.id, e.target.value)} 
                    placeholder={`e.g. ${idx === 0 ? 'Higher timeframe bias confirmed' : 'No emotional entry'}`} 
                  />
                </div>
                <button type="button" onClick={() => removeRule('checklist', rule.id)} className="mt-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {formData.checklist.length === 0 && (
              <div className="text-sm text-slate-500 italic py-2">No checklist items defined.</div>
            )}
          </div>
        </Card>

        {/* Risk Management Preferences */}
        <Card className="p-8 shadow-sm border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Risk Management Preferences</h3>
          <p className="text-sm text-slate-500 mb-6">Set preferred risk limits. If a trade violates these limits, you'll receive a warning when recording it.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Default Risk (USD)</Label>
              <Input type="number" step="any" value={formData.riskRules.defaultRisk} onChange={(e) => handleNestedChange('riskRules', 'defaultRisk', e.target.value)} placeholder="e.g. 100" />
            </div>
            <div className="space-y-2">
              <Label>Max Risk (USD)</Label>
              <Input type="number" step="any" value={formData.riskRules.maxRisk} onChange={(e) => handleNestedChange('riskRules', 'maxRisk', e.target.value)} placeholder="e.g. 250" />
            </div>
            <div className="space-y-2">
              <Label>Minimum R:R</Label>
              <Input type="number" step="any" value={formData.riskRules.minRR} onChange={(e) => handleNestedChange('riskRules', 'minRR', e.target.value)} placeholder="e.g. 2.0" />
            </div>
            <div className="space-y-2">
              <Label>Max Trades / Day</Label>
              <Input type="number" value={formData.riskRules.maxTradesPerDay} onChange={(e) => handleNestedChange('riskRules', 'maxTradesPerDay', e.target.value)} placeholder="e.g. 3" />
            </div>
          </div>
        </Card>

        {/* Sticky Actions */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <Button type="button" variant="ghost" onClick={() => navigate('/strategies')} className="hidden sm:flex">
            Cancel
          </Button>
          <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[160px] gap-2">
            <Save className="w-4 h-4" /> Save Strategy
          </Button>
        </div>
      </form>
    </div>
  );
}
