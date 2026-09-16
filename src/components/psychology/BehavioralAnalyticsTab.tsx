import React, { useMemo, useState } from 'react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Brain, TrendingDown, TrendingUp, AlertTriangle, Fingerprint, Activity, Beaker, ChevronRight, Flame, Globe2, Sparkles, Info } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { EvidenceExplorerModal } from '@/components/analytics/EvidenceExplorerModal';

interface BehavioralAnalyticsProps {
  trades: Trade[];
}

export function BehavioralAnalyticsTab({ trades }: BehavioralAnalyticsProps) {
  // Compute Behavioral Fingerprint
  const fingerprint = useMemo(() => {
    const fomoCount = trades.filter(t => t.emotions?.includes('FOMO')).length;
    const revengeCount = trades.filter(t => t.emotions?.includes('Revenge')).length;
    const ruleSkipCount = trades.filter(t => t.ruleAdherence !== undefined && t.ruleAdherence < 100).length;
    
    // Sort trades chronologically
    const sortedTrades = [...trades].sort((a,b) => a.date - b.date);
    
    let riskEscalationAfterWin = 0;
    let riskEscalationAfterWinSample = 0;
    let ruleAdherenceAfterLoss = 0;
    let ruleAdherenceAfterLossSample = 0;

    for (let i = 1; i < sortedTrades.length; i++) {
      const prev = sortedTrades[i-1];
      const curr = sortedTrades[i];
      if (prev.result === 'WIN') {
        riskEscalationAfterWinSample++;
        if (curr.risk > prev.risk) riskEscalationAfterWin++;
      }
      if (prev.result === 'LOSS') {
        ruleAdherenceAfterLossSample++;
        if (curr.ruleAdherence !== undefined) {
          ruleAdherenceAfterLoss += curr.ruleAdherence;
        }
      }
    }

    const avgRuleAfterLoss = ruleAdherenceAfterLossSample > 0 ? ruleAdherenceAfterLoss / ruleAdherenceAfterLossSample : 0;
    
    let strongestBehavior = "Neutral";
    if (avgRuleAfterLoss > 90) strongestBehavior = "High rule adherence after losses";
    else if (avgRuleAfterLoss < 50) strongestBehavior = "Low rule adherence after losses";

    let potentialWeakness = "None detected";
    if (riskEscalationAfterWinSample > 0 && riskEscalationAfterWin / riskEscalationAfterWinSample > 0.4) {
      potentialWeakness = "Risk escalation after winning trades";
    } else if (fomoCount / trades.length > 0.2) {
      potentialWeakness = "Frequent FOMO entries";
    }

    return {
      fomoCount,
      revengeCount,
      ruleSkipCount,
      strongestBehavior,
      potentialWeakness,
      sampleSize: trades.length,
      confidence: trades.length < 15 ? 'Preliminary' : trades.length < 30 ? 'Moderate' : 'Stronger Historical Observation'
    };
  }, [trades]);

  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceProps, setEvidenceProps] = useState({
    claim: '',
    methodology: '',
    limitations: '',
    trades: [] as Trade[],
    statisticLabel: '',
    statisticValue: ''
  });

  const handleOpenEvidence = (claim: string, methodology: string, limitations: string, filterTrades: Trade[], statisticLabel: string, statisticValue: string) => {
    setEvidenceProps({ claim, methodology, limitations, trades: filterTrades, statisticLabel, statisticValue });
    setEvidenceModalOpen(true);
  };

  if (trades.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Insufficient Data for Behavioral Analytics</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          A minimum of 5 trades is required to establish a preliminary behavioral fingerprint.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* 1. Behavioral Fingerprint */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Behavioral Fingerprint</h2>
              <p className="text-xs text-slate-500">Based ONLY on your recorded trading behavior</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            fingerprint.sampleSize < 15 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            Confidence: {fingerprint.confidence}
          </span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Strongest Recorded Behavior</h3>
              <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {fingerprint.strongestBehavior}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Potential Behavioral Pattern</h3>
              <div className="text-lg font-bold text-amber-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {fingerprint.potentialWeakness}
              </div>
            </div>
          </div>
          <div className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-slate-600">Recorded FOMO Entries</span>
                 <span className="text-sm font-bold text-slate-900">{fingerprint.fomoCount}</span>
               </div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-slate-600">Recorded Revenge Trades</span>
                 <span className="text-sm font-bold text-slate-900">{fingerprint.revengeCount}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600">Rule Deviations</span>
                 <span className="text-sm font-bold text-slate-900">{fingerprint.ruleSkipCount}</span>
               </div>
             </div>
             <p className="text-[10px] text-slate-400 leading-tight">
               *This profile evaluates statistical occurrences of tagged behaviors and risk/rule deviations. It does not constitute a psychological diagnosis.
             </p>
          </div>
        </div>
      </div>

      {/* 2. Before / During / After Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
            Before Trade
          </h3>
          <div className="flex-1 space-y-3">
            <div className="text-sm text-slate-600">Common Entry Emotions:</div>
            <div className="flex flex-wrap gap-2">
              {['Calm', 'FOMO', 'Anxious'].map(em => {
                 const count = trades.filter(t => t.emotions?.includes(em as any)).length;
                 if (count === 0) return null;
                 return <span key={em} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">{em} ({count})</span>
              })}
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-xs">2</span>
            During Trade
          </h3>
          <div className="flex-1 space-y-3">
            <div className="text-sm text-slate-600">In-Trade Emotions:</div>
            <div className="flex flex-wrap gap-2">
              {['Anxious', 'Impatient', 'Confident', 'Frustrated'].map(em => {
                 const count = trades.filter(t => t.duringEmotions?.includes(em as any)).length;
                 if (count === 0) return null;
                 return <span key={em} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">{em} ({count})</span>
              })}
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">3</span>
            After Trade
          </h3>
          <div className="flex-1 space-y-3">
            <div className="text-sm text-slate-600">Exit Emotions:</div>
            <div className="flex flex-wrap gap-2">
              {['Relieved', 'Greedy', 'Frustrated', 'Satisfied'].map(em => {
                 const count = trades.filter(t => t.exitEmotion === em).length;
                 if (count === 0) return null;
                 return <span key={em} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">{em} ({count})</span>
              })}
            </div>
          </div>
        </Card>
      </div>

      <EvidenceExplorerModal 
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        {...evidenceProps}
      />

    </div>
  );
}
