import React, { useState, useMemo } from 'react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, Play, AlertTriangle, FlaskConical } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { CorrelationLab } from './CorrelationLab';
import { OutlierLab } from './OutlierLab';

interface QuantLabTabProps {
  trades: Trade[];
}

export function QuantLabTab({ trades }: QuantLabTabProps) {
  const closedTrades = useMemo(() => {
    return trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN').sort((a,b) => a.date - b.date);
  }, [trades]);

  const [startingEquity, setStartingEquity] = useState(10000);
  const [simulationCount, setSimulationCount] = useState(100); // number of paths
  const [simulationLength, setSimulationLength] = useState(100); // number of trades per path
  
  const [simResults, setSimResults] = useState<{
    paths: any[];
    medianEnding: number;
    worstEnding: number;
    bestEnding: number;
    worstDrawdown: number;
    medianDrawdown: number;
    probExceedingHistDD: number;
    histDD: number;
    maxLossStreak: number;
  } | null>(null);

  const runMonteCarlo = () => {
    if (closedTrades.length < 5) return;
    
    // Extract actual historical returns (PnL or R, here we use PnL relative to equity if we want to compound, or just absolute PnL)
    // To make it simple and robust, we will just sample absolute PnL or use R multiples.
    // Given the constraints, let's use exact historical PnL amounts, or if user trades variable size, R-multiples are better.
    // Let's use R-multiples to calculate percentage return, or if not available, absolute PnL.
    
    // For this simulation, we'll use historical absolute PnL for simplicity to avoid assuming risk%.
    const histPnLs = closedTrades.map(t => t.pnl || 0);
    
    // Historical drawdown
    let peak = 0;
    let current = 0;
    let histMaxDD = 0;
    for (const pnl of histPnLs) {
      current += pnl;
      if (current > peak) peak = current;
      const dd = peak - current;
      if (dd > histMaxDD) histMaxDD = dd;
    }

    const paths: any[] = [];
    let endEquities: number[] = [];
    let drawdowns: number[] = [];
    let lossStreaks: number[] = [];
    let histDDExceededCount = 0;

    // We only need to store median, 5th percentile, 95th percentile paths to avoid overwhelming recharts
    const allPaths: number[][] = [];

    for (let i = 0; i < simulationCount; i++) {
      let equity = startingEquity;
      let pathPeak = startingEquity;
      let pathMaxDD = 0;
      let currentLossStreak = 0;
      let maxLossStreak = 0;
      
      const path: number[] = [equity];
      
      for (let j = 0; j < simulationLength; j++) {
        // Randomly pick a historical trade
        const randomIndex = Math.floor(Math.random() * histPnLs.length);
        const pnl = histPnLs[randomIndex];
        
        equity += pnl;
        path.push(equity);

        if (equity > pathPeak) pathPeak = equity;
        const dd = pathPeak - equity;
        if (dd > pathMaxDD) pathMaxDD = dd;

        if (pnl < 0) {
          currentLossStreak++;
          if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
        } else if (pnl > 0) {
          currentLossStreak = 0;
        }
      }

      allPaths.push(path);
      endEquities.push(equity);
      drawdowns.push(pathMaxDD);
      lossStreaks.push(maxLossStreak);
      
      if (pathMaxDD > histMaxDD) {
        histDDExceededCount++;
      }
    }

    endEquities.sort((a,b) => a - b);
    drawdowns.sort((a,b) => a - b);
    lossStreaks.sort((a,b) => a - b);
    
    // Transpose allPaths to find median/percentile per step
    const stepPaths: any[] = [];
    for (let step = 0; step <= simulationLength; step++) {
      const stepValues = allPaths.map(p => p[step]).sort((a,b) => a - b);
      stepPaths.push({
        step: `T${step}`,
        p05: stepValues[Math.floor(simulationCount * 0.05)],
        median: stepValues[Math.floor(simulationCount * 0.5)],
        p95: stepValues[Math.floor(simulationCount * 0.95)]
      });
    }

    setSimResults({
      paths: stepPaths,
      medianEnding: endEquities[Math.floor(simulationCount * 0.5)],
      worstEnding: endEquities[0],
      bestEnding: endEquities[simulationCount - 1],
      worstDrawdown: drawdowns[simulationCount - 1],
      medianDrawdown: drawdowns[Math.floor(simulationCount * 0.5)],
      probExceedingHistDD: (histDDExceededCount / simulationCount) * 100,
      histDD: histMaxDD,
      maxLossStreak: lossStreaks[Math.floor(simulationCount * 0.95)] // 95th percentile max loss streak
    });
  };

  if (closedTrades.length < 30) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Insufficient Data for Quant Lab</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Monte Carlo simulations and Quantitative Research require a minimum of 30 closed trades to generate statistically reliable bounds. You have {closedTrades.length}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Monte Carlo Simulation Lab</h2>
            <p className="text-sm text-slate-500">
              Randomizes your exact historical trade sequences to model probability distributions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Starting Equity ($)</label>
            <input 
              type="number" 
              value={startingEquity}
              onChange={(e) => setStartingEquity(Number(e.target.value))}
              className="mt-1 w-full text-sm p-2 rounded-md border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Simulations (Paths)</label>
            <select
              value={simulationCount}
              onChange={(e) => setSimulationCount(Number(e.target.value))}
              className="mt-1 w-full text-sm p-2 rounded-md border border-slate-200 bg-white"
            >
              <option value={100}>100 Paths</option>
              <option value={500}>500 Paths</option>
              <option value={1000}>1000 Paths</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Trades per Path</label>
            <input 
              type="number" 
              value={simulationLength}
              onChange={(e) => setSimulationLength(Number(e.target.value))}
              className="mt-1 w-full text-sm p-2 rounded-md border border-slate-200 bg-white"
            />
          </div>
        </div>

        <Button onClick={runMonteCarlo} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
          <Play className="w-4 h-4 mr-2" />
          Run Simulation
        </Button>
      </div>

      {simResults && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-lg">
            <Info className="w-4 h-4 shrink-0" />
            <p><strong>Hypothetical Simulation:</strong> This does not predict future performance. It demonstrates possible outcomes if your future edge exactly matches your historical edge.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">Median Ending Equity</div>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(simResults.medianEnding)}</div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">Worst Case Ending (1st Pct)</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(simResults.worstEnding)}</div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">Median Drawdown</div>
              <div className="text-xl font-bold text-slate-900">-{formatCurrency(simResults.medianDrawdown)}</div>
            </Card>
            <Card className="p-4 border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">Prob. of Exceeding Hist. DD</div>
              <div className="text-xl font-bold text-amber-600">{formatNumber(simResults.probExceedingHistDD, 1)}%</div>
            </Card>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Simulated Equity Paths (5th to 95th Percentile)</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simResults.paths} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="step" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="p95" name="95th Pct (Optimistic)" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="median" name="Median" stroke="#1e40af" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="p05" name="5th Pct (Pessimistic)" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      )}
      
      <CorrelationLab trades={trades} />
      <OutlierLab trades={trades} />
    </div>
  );
}
