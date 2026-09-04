import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Label, Textarea, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useData } from '@/contexts/DataContext';
import { getSettings } from '@/lib/settings';
import { Trade, Market, Direction, Session, Emotion, Timeframe, MarketCondition, Strategy } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { calculateTradeMetrics } from '@/lib/calculations';
import { UploadCloud, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AddTrade() {
  const navigate = useNavigate();
  const { strategies: rawStrategies, saveTrade } = useData();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  
  const [formData, setFormData] = useState(() => {
    const s = getSettings();
    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      market: (s.entryPreferences.market || '') as Market,
      direction: (s.entryPreferences.direction || 'BUY') as Direction,
      entry: '',
      stopLoss: '',
      takeProfit: '',
      positionSize: '',
      risk: '',
      riskPercent: s.entryPreferences.risk || s.risk.defaultRisk.toString(),
      strategy: s.entryPreferences.strategy || '',
      session: (s.entryPreferences.session || '') as Session,
      timeframe: (s.entryPreferences.timeframe || '') as Timeframe,
      marketCondition: '' as MarketCondition,
      emotions: [] as Emotion[],
      notes: '',
      mistake: '',
      learning: '',
      result: '' as 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | '',
      pnl: '',
      screenshot: '',
    };
  });

  const [otherEmotion, setOtherEmotion] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setStrategies(rawStrategies.filter(s => s.status === 'Active'));
  }, [rawStrategies]);

  const selectedStrategyObj = useMemo(() => {
    return strategies.find(s => s.id === formData.strategy || s.name === formData.strategy);
  }, [formData.strategy, strategies]);

  // Strategy Risk Check
  const riskWarning = useMemo(() => {
    if (!selectedStrategyObj || !formData.risk) return null;
    const currentRisk = parseFloat(formData.risk);
    const maxRisk = selectedStrategyObj.riskRules.maxRisk;
    if (maxRisk > 0 && currentRisk > maxRisk) {
      return `Your planned risk ($${currentRisk}) exceeds this strategy's maximum risk ($${maxRisk}).`;
    }
    return null;
  }, [selectedStrategyObj, formData.risk]);

  // Auto Calculations
  const [calc, setCalc] = useState({
    rrRatio: 0,
    potentialProfit: 0,
    potentialLoss: 0,
  });

  useEffect(() => {
    const metrics = calculateTradeMetrics({
      entry: parseFloat(formData.entry),
      stopLoss: parseFloat(formData.stopLoss),
      takeProfit: parseFloat(formData.takeProfit),
      direction: formData.direction as Direction,
      risk: parseFloat(formData.risk),
      positionSize: parseFloat(formData.positionSize)
    });

    if (metrics) {
      setCalc({
        rrRatio: parseFloat(metrics.riskRewardRatio.toFixed(2)),
        potentialProfit: parseFloat(metrics.potentialProfit.toFixed(2)),
        potentialLoss: parseFloat(metrics.potentialLoss.toFixed(2))
      });
    } else {
      setCalc({ rrRatio: 0, potentialProfit: 0, potentialLoss: 0 });
    }
  }, [formData.entry, formData.stopLoss, formData.takeProfit, formData.risk, formData.direction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEmotion = (emotion: string) => {
    setFormData(prev => {
      if (prev.emotions.includes(emotion)) {
        return { ...prev, emotions: prev.emotions.filter(e => e !== emotion) };
      }
      return { ...prev, emotions: [...prev.emotions, emotion] };
    });
  };

  const handleAddOtherEmotion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otherEmotion.trim()) {
      e.preventDefault();
      if (!formData.emotions.includes(otherEmotion.trim())) {
        toggleEmotion(otherEmotion.trim());
      }
      setOtherEmotion('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setFormData(prev => ({ ...prev, screenshot: '' }));
  };

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    
    let finalPnl = undefined;
    if (formData.result === 'WIN' || formData.result === 'LOSS') {
      if (formData.pnl !== '') {
        finalPnl = parseFloat(formData.pnl);
        if (formData.result === 'LOSS' && finalPnl > 0) finalPnl = -finalPnl;
      } else {
        finalPnl = formData.result === 'WIN' ? calc.potentialProfit : -calc.potentialLoss;
      }
    } else if (formData.result === 'BREAK EVEN') {
      finalPnl = 0;
    }
    
    let ruleAdherence: number | undefined = undefined;
    if (selectedStrategyObj && selectedStrategyObj.checklist.length > 0) {
      const completed = Object.values(checklistState).filter(Boolean).length;
      ruleAdherence = Math.round((completed / selectedStrategyObj.checklist.length) * 100);
    }

    // Parse date and time to timestamp
    let tradeTimestamp = Date.now();
    if (formData.date) {
      const dateStr = formData.time ? `${formData.date}T${formData.time}` : `${formData.date}T12:00`;
      tradeTimestamp = new Date(dateStr).getTime();
    }

    const tradePayload = {
      date: tradeTimestamp,
      time: formData.time,
      market: formData.market,
      direction: formData.direction,
      entry: parseFloat(formData.entry) || 0,
      stopLoss: parseFloat(formData.stopLoss) || 0,
      takeProfit: parseFloat(formData.takeProfit) || 0,
      positionSize: parseFloat(formData.positionSize) || 0,
      risk: parseFloat(formData.risk) || 0,
      riskPercent: parseFloat(formData.riskPercent) || 0,
      strategy: formData.strategy, // Using the name or ID as string
      session: formData.session,
      timeframe: formData.timeframe,
      marketCondition: formData.marketCondition,
      emotions: formData.emotions,
      notes: formData.notes,
      mistake: formData.mistake,
      learning: formData.learning,
      screenshot: formData.screenshot,
      result: formData.result ? formData.result as any : undefined,
      pnl: finalPnl,
      rrRatio: calc.rrRatio,
      rMultiple: finalPnl && parseFloat(formData.risk) > 0 ? finalPnl / parseFloat(formData.risk) : undefined,
      ruleAdherence,
      checklistState,
    };

    try {
      await saveTrade(tradePayload);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      if (addAnother) {
        setFormData(prev => ({
          ...prev,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          entry: '', stopLoss: '', takeProfit: '', notes: '', mistake: '', learning: '', risk: '', riskPercent: '', positionSize: '', screenshot: '', result: '', pnl: ''
        }));
        setChecklistState({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/journal');
      }
    } catch (error: any) {
      console.error('Error saving trade:', error);
      alert(error.message || 'Failed to save trade.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-40 md:pb-24 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add New Trade</h1>
        <p className="text-slate-500 mt-1">Document your trade details thoroughly.</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        
        {/* Date & Time */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Trade Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base">Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="space-y-3">
              <Label className="text-base">Time</Label>
              <Input type="time" name="time" value={formData.time} onChange={handleInputChange} />
            </div>
          </div>
        </Card>

        {/* Market & Direction */}
        <Card className="p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base">Market</Label>
              <select
                name="market"
                value={formData.market}
                onChange={handleInputChange}
                required
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                <option value="" disabled>Select a market...</option>
                <option value="XAU/USD">Gold (XAU/USD)</option>
                <option value="BTC/USD">Bitcoin (BTC/USD)</option>
                <option value="ETH/USD">Ethereum (ETH/USD)</option>
                <option value="SOL/USD">Solana (SOL/USD)</option>
                <option value="XRP/USD">Ripple (XRP/USD)</option>
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/USD">GBP/USD</option>
                <option value="JPY/USD">JPY/USD</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-base">Direction</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'BUY' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.direction === 'BUY' 
                      ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-green-200 hover:bg-green-50'
                  )}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'SELL' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.direction === 'SELL' 
                      ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50'
                  )}
                >
                  SELL (SHORT)
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Trade Parameters & Calculations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-8 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Execution Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Entry Price</Label>
                <Input name="entry" type="number" step="any" placeholder="e.g. 2458.20" required value={formData.entry} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Lot / Position Size</Label>
                <Input name="positionSize" type="number" step="any" placeholder="e.g. 0.50" required value={formData.positionSize} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Stop Loss</Label>
                <Input name="stopLoss" type="number" step="any" placeholder="e.g. 2453.20" required value={formData.stopLoss} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Risk Amount (USD)</Label>
                <Input name="risk" type="number" step="any" placeholder="e.g. 250" icon={<span className="text-sm font-medium">$</span>} value={formData.risk} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Risk %</Label>
                <Input name="riskPercent" type="number" step="any" placeholder="e.g. 1.0" icon={<span className="text-sm font-medium">%</span>} value={formData.riskPercent} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Take Profit</Label>
                <Input name="takeProfit" type="number" step="any" placeholder="e.g. 2470.20" value={formData.takeProfit} onChange={handleInputChange} />
              </div>
            </div>

            {riskWarning && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Strategy Risk Rule Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">{riskWarning}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-sm bg-slate-900 text-white flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Auto Calculations</h3>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Risk : Reward</p>
                <div className="text-3xl font-light">
                  1 : <span className="font-bold text-white">{calc.rrRatio > 0 ? calc.rrRatio : '-'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pot. Loss</p>
                  <p className="text-lg font-semibold text-red-400">{calc.potentialLoss > 0 ? formatCurrency(calc.potentialLoss) : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pot. Profit</p>
                  <p className="text-lg font-semibold text-green-400">{calc.potentialProfit > 0 ? formatCurrency(calc.potentialProfit) : '-'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Strategy & Context */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Context & Strategy</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base text-slate-800 font-semibold">Strategy</Label>
                {strategies.length > 0 ? (
                  <select 
                    name="strategy" 
                    value={formData.strategy} 
                    onChange={handleInputChange} 
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Strategy...</option>
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input name="strategy" value={formData.strategy} onChange={handleInputChange} placeholder="e.g. Liquidity Sweep" />
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Session</Label>
                  <select name="session" value={formData.session} onChange={handleInputChange} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['Asian', 'London', 'New York', 'Sydney'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Timeframe</Label>
                  <select name="timeframe" value={formData.timeframe} onChange={handleInputChange} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['1m', '3m', '5m', '15m', '30m', '1H', '4H', 'Daily', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Condition</Label>
                  <select name="marketCondition" value={formData.marketCondition} onChange={handleInputChange} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['Trending', 'Ranging', 'Breakout', 'Reversal', 'Choppy', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {selectedStrategyObj && selectedStrategyObj.checklist.length > 0 && (
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Strategy Checklist</h4>
                  <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {Object.values(checklistState).filter(Boolean).length} / {selectedStrategyObj.checklist.length} completed
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedStrategyObj.checklist.map(item => (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={checklistState[item.id] || false}
                          onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className={cn("text-sm transition-colors", checklistState[item.id] ? "text-slate-400 line-through" : "text-slate-700")}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-end">
                <Label className="text-base">Strategy / Trade Thesis</Label>
                <span className="text-xs text-slate-400">{formData.strategy.length} chars</span>
              </div>
              <Textarea 
                name="strategy" 
                value={formData.strategy} 
                onChange={handleInputChange}
                className="min-h-[120px]" 
                placeholder="Why did you take this trade? What setup did you identify? What confirmation did you wait for?"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Emotions</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {['Calm', 'FOMO', 'Revenge', 'Fear', 'Greed', 'Confident', 'Hesitant', 'Impatient'].map(emotion => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotion(emotion)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      formData.emotions.includes(emotion)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {emotion}
                  </button>
                ))}
                
                {formData.emotions.filter(e => !['Calm', 'FOMO', 'Revenge', 'Fear', 'Greed', 'Confident', 'Hesitant', 'Impatient'].includes(e)).map(e => (
                   <button
                   key={e}
                   type="button"
                   onClick={() => toggleEmotion(e)}
                   className="px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-600 bg-indigo-50 text-indigo-700 flex items-center gap-1"
                 >
                   {e} <X className="w-3 h-3" />
                 </button>
                ))}

                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Other (press enter)" 
                    className="h-8 text-sm w-40 rounded-full"
                    value={otherEmotion}
                    onChange={(e) => setOtherEmotion(e.target.value)}
                    onKeyDown={handleAddOtherEmotion}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Screenshot */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Screenshot</h3>
          
          {formData.screenshot ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
              <img src={formData.screenshot} alt="Trade Screenshot" className="w-full h-auto object-cover max-h-[400px]" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Label htmlFor="screenshot-upload" className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-100">
                  Replace
                </Label>
                <button type="button" onClick={handleRemoveScreenshot} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600">
                  Remove
                </button>
              </div>
              <input 
                id="screenshot-upload"
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          ) : (
            <Label htmlFor="screenshot-upload" className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">PNG, JPG, JPEG (max 5MB)</p>
              <input 
                id="screenshot-upload"
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </Label>
          )}
        </Card>

        {/* Notes & Learning */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Review & Result</h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-base">Trade Result (Optional)</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'WIN' ? '' : 'WIN' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'WIN' 
                      ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-green-200 hover:bg-green-50'
                  )}
                >
                  WIN
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'LOSS' ? '' : 'LOSS' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'LOSS' 
                      ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50'
                  )}
                >
                  LOSS
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'PENDING' ? '' : 'PENDING' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'PENDING' 
                      ? 'border-yellow-500 bg-yellow-500 text-white shadow-md shadow-yellow-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-yellow-300 hover:bg-yellow-50'
                  )}
                >
                  PENDING
                </button>
              </div>
            </div>

            {(formData.result === 'WIN' || formData.result === 'LOSS') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Realized P&L (USD)</Label>
                <Input 
                  name="pnl" 
                  type="number" 
                  step="any" 
                  placeholder={formData.result === 'WIN' ? calc.potentialProfit.toString() : calc.potentialLoss.toString()} 
                  value={formData.pnl} 
                  onChange={handleInputChange} 
                  icon={<span className="text-sm font-medium">$</span>}
                />
                <p className="text-xs text-slate-500">Leave blank to use calculated auto-P&L.</p>
              </div>
            )}
            {formData.result === 'PENDING' && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                Result is pending. Realized P&L will not be calculated.
              </div>
            )}

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Why did you take this trade?" />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600">What mistake did I make?</Label>
                <Textarea name="mistake" value={formData.mistake} onChange={handleInputChange} placeholder="Entered too early, moved SL, overtraded..." className="focus:ring-red-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-green-600">What did I learn from this trade?</Label>
                <Textarea name="learning" value={formData.learning} onChange={handleInputChange} placeholder="What will you do differently next time?" className="focus:ring-green-500" />
              </div>
            </div>
          </div>
        </Card>

        {/* Sticky Actions */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)} className="w-full sm:w-auto">
            Save & Add Another
          </Button>
          <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[160px]">
            Save Trade
          </Button>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 right-8 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-medium text-sm">Trade saved successfully.</span>
        </div>
      )}
    </div>
  );
}
