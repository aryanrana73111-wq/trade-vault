import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Trade, Strategy } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  Brain, AlertTriangle, CheckCircle2, TrendingDown, Target, Activity, Clock
} from 'lucide-react';
import { 
  calculatePsychologyScore, analyzeEmotions, analyzeRuleAdherence, 
  detectRevengeTrades, detectRiskEscalation, analyzeAfterLoss,
  getBestPsychologicalState
} from '@/lib/psychology';
import { Link } from 'react-router-dom';

export default function Psychology() {
  const { trades: rawTrades, strategies: rawStrategies } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    setTrades([...rawTrades]);
    setStrategies([...rawStrategies]);
  }, [rawTrades, rawStrategies]);

  if (trades.length < 5) {
    return (
      <div className="max-w-4xl mx-auto pb-24 space-y-6 animate-in fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trading Psychology</h1>
          <p className="text-slate-500 mt-1">Understand how your behavior affects your execution.</p>
        </div>
        
        <Card className="p-12 text-center border-dashed border-slate-300 bg-slate-50">
          <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900">Your behavioral analytics will appear here.</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto mb-6">
            Start recording trades with emotions, rule adherence, and execution details to uncover your personal trading patterns. Minimum 5 trades required.
          </p>
          <Link to="/add">
            <Button>Add Your First Trade</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { score, breakdown } = calculatePsychologyScore(trades);
  const emotionStats = analyzeEmotions(trades);
  const adherenceStats = analyzeRuleAdherence(trades);
  const revengeSequences = detectRevengeTrades(trades);
  const riskEscalations = detectRiskEscalation(trades);
  const afterLossStats = analyzeAfterLoss(trades);
  const bestState = getBestPsychologicalState(trades);

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trading Psychology</h1>
          <p className="text-slate-500 mt-1">Understand how your behavior affects your execution.</p>
        </div>
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 md:col-span-1 bg-slate-900 text-white flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Behavioral Score</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-light">{score}</span>
              <span className="text-lg text-slate-400 mb-1">/ 100</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">TradeVault Behavioral Score</p>
          </div>
          <Brain className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-800 opacity-50 pointer-events-none" />
        </Card>

        <Card className="p-6 md:col-span-3 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Rule Adherence</p>
              <p className={cn("text-xl font-semibold", breakdown.ruleAdherence >= 80 ? "text-green-600" : "text-slate-900")}>{breakdown.ruleAdherence}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Risk Discipline</p>
              <p className={cn("text-xl font-semibold", breakdown.riskDiscipline >= 80 ? "text-green-600" : "text-slate-900")}>{breakdown.riskDiscipline}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">FOMO Control</p>
              <p className={cn("text-xl font-semibold", breakdown.fomoControl >= 80 ? "text-green-600" : "text-slate-900")}>{breakdown.fomoControl}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Revenge Control</p>
              <p className={cn("text-xl font-semibold", breakdown.revengeControl >= 80 ? "text-green-600" : "text-slate-900")}>{breakdown.revengeControl}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Emotional Stability</p>
              <p className={cn("text-xl font-semibold", breakdown.emotionalStability >= 80 ? "text-green-600" : "text-slate-900")}>{breakdown.emotionalStability}%</p>
            </div>
          </div>
          
          {bestState && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
              <Target className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900">Your Strongest Historical Execution Profile</h4>
                <p className="text-sm text-blue-800 mt-1">
                  You perform best when your state is <strong>{bestState.emotion}</strong>, paired with <strong>{bestState.avgRuleAdherence}%</strong> rule adherence.
                </p>
                <div className="flex gap-4 mt-3 pt-3 border-t border-blue-200/50">
                  <span className="text-xs font-medium text-blue-700">Avg R: <strong className="text-blue-900">+{bestState.avgR}R</strong></span>
                  <span className="text-xs font-medium text-blue-700">Win Rate: <strong className="text-blue-900">{bestState.winRate}%</strong></span>
                  <span className="text-xs font-medium text-blue-700">Sample: <strong className="text-blue-900">{bestState.count} trades</strong></span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 2. PSYCHOLOGY VS PERFORMANCE MATRIX */}
      <Card className="shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Psychology vs Performance</h3>
          <p className="text-sm text-slate-500 mt-1">Historically, these trades performed differently based on your recorded emotions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Emotion</th>
                <th className="px-6 py-4">Trades</th>
                <th className="px-6 py-4">Win Rate</th>
                <th className="px-6 py-4">Avg R</th>
                <th className="px-6 py-4">Net P&L</th>
                <th className="px-6 py-4">Rule Adherence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emotionStats.length > 0 ? emotionStats.map(stat => (
                <tr key={stat.emotion} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {stat.emotion}
                      {stat.count < 5 && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">Small Sample</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">{stat.count}</td>
                  <td className="px-6 py-4">{stat.winRate}%</td>
                  <td className={cn("px-6 py-4 font-medium", stat.avgR > 0 ? "text-green-600" : stat.avgR < 0 ? "text-red-600" : "")}>
                    {stat.avgR > 0 ? '+' : ''}{stat.avgR}R
                  </td>
                  <td className={cn("px-6 py-4 font-medium", stat.netPnl > 0 ? "text-green-600" : stat.netPnl < 0 ? "text-red-600" : "")}>
                    {formatCurrency(stat.netPnl)}
                  </td>
                  <td className="px-6 py-4">{stat.avgRuleAdherence}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Not enough data to identify a reliable pattern.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. BEHAVIORAL LEAKS */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Behavioral Leaks</h2>
          <p className="text-sm text-slate-500 mt-1">Recurring behaviors that may negatively affect your execution.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenge Trading */}
          <Card className="p-6 shadow-sm border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-slate-900">Revenge Trading Pattern</h3>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {revengeSequences.length} Detected
              </span>
            </div>
            
            {revengeSequences.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Your journal shows you occasionally re-enter the market shortly after a loss.</p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-2">
                  <div className="flex justify-between text-slate-500 text-xs mb-1">
                    <span>Recent Sequence Example</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-red-600">LOSS</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-700">{revengeSequences[0].minutesDiff} mins later</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-700">Risk +{revengeSequences[0].riskIncrease}%</span>
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Suggested Experiment</h4>
                  <p className="text-sm text-slate-800">After any loss, wait at least 15 minutes before another entry.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-2">No significant revenge trading patterns detected in your recent data.</p>
            )}
          </Card>

          {/* Risk Escalation */}
          <Card className="p-6 shadow-sm border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-900">Risk Escalation</h3>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {riskEscalations.length} Detected
              </span>
            </div>
            
            {riskEscalations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Your recorded risk occasionally increases after winning streaks.</p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Avg Risk (During Streak)</p>
                      <p className="font-medium text-slate-900">{formatCurrency(riskEscalations[0].avgStreakRisk)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Escalated Risk (After)</p>
                      <p className="font-medium text-red-600">{formatCurrency(riskEscalations[0].escalatedRisk)}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Suggested Experiment</h4>
                  <p className="text-sm text-slate-800">Keep risk fixed for the next 20 trades and compare performance.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-2">Your risk sizing appears consistent after winning streaks.</p>
            )}
          </Card>
        </div>
      </div>

      {/* 4. PERFORMANCE COMPARISONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rule Adherence */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-slate-900">Rule Adherence vs Performance</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Rules Followed</p>
                <p className="text-xs text-slate-500 mb-2">{adherenceStats.followed.count} trades</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                <p className="text-sm font-semibold text-slate-900">{adherenceStats.followed.winRate}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Avg R</p>
                <p className={cn("text-sm font-semibold", adherenceStats.followed.avgR > 0 ? "text-green-600" : "")}>
                  {adherenceStats.followed.avgR > 0 ? '+' : ''}{adherenceStats.followed.avgR}R
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Rules Broken</p>
                <p className="text-xs text-slate-500 mb-2">{adherenceStats.broken.count} trades</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                <p className="text-sm font-semibold text-slate-900">{adherenceStats.broken.winRate}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Avg R</p>
                <p className={cn("text-sm font-semibold", adherenceStats.broken.avgR > 0 ? "text-green-600" : adherenceStats.broken.avgR < 0 ? "text-red-600" : "")}>
                  {adherenceStats.broken.avgR > 0 ? '+' : ''}{adherenceStats.broken.avgR}R
                </p>
              </div>
            </div>
            
            {adherenceStats.followed.count > 0 && adherenceStats.broken.count > 0 && (
              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                <strong>Historical observation:</strong> Your rule-followed trades have historically produced {adherenceStats.followed.avgR > adherenceStats.broken.avgR ? 'higher' : 'different'} Avg R than rule-broken trades.
              </div>
            )}
          </div>
        </Card>

        {/* After a Loss */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">What Happens After a Loss?</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Immediate Re-entry (&lt;15m)</p>
                <p className="text-xs text-slate-500">{afterLossStats.immediate.count} trades</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", afterLossStats.immediate.avgR > 0 ? "text-green-600" : afterLossStats.immediate.avgR < 0 ? "text-red-600" : "text-slate-900")}>
                  {afterLossStats.immediate.avgR > 0 ? '+' : ''}{afterLossStats.immediate.avgR}R
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Waited 15-60 min</p>
                <p className="text-xs text-slate-500">{afterLossStats.shortWait.count} trades</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", afterLossStats.shortWait.avgR > 0 ? "text-green-600" : afterLossStats.shortWait.avgR < 0 ? "text-red-600" : "text-slate-900")}>
                  {afterLossStats.shortWait.avgR > 0 ? '+' : ''}{afterLossStats.shortWait.avgR}R
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Waited &gt;60 min</p>
                <p className="text-xs text-slate-500">{afterLossStats.longWait.count} trades</p>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", afterLossStats.longWait.avgR > 0 ? "text-green-600" : afterLossStats.longWait.avgR < 0 ? "text-red-600" : "text-slate-900")}>
                  {afterLossStats.longWait.avgR > 0 ? '+' : ''}{afterLossStats.longWait.avgR}R
                </p>
              </div>
            </div>
            
            {(afterLossStats.immediate.count + afterLossStats.shortWait.count + afterLossStats.longWait.count) < 5 && (
              <p className="text-xs text-slate-500 mt-2">Small sample size. More data needed to form a conclusion.</p>
            )}
          </div>
        </Card>
      </div>

      {/* DISCLAIMER */}
      <div className="pt-8 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center max-w-3xl mx-auto">
          TradeVault Psychology provides behavioral observations based on your journal data. It does not diagnose mental health conditions, predict future performance, or guarantee trading outcomes. Historical patterns are observational and should be tested with additional data.
        </p>
      </div>

    </div>
  );
}
