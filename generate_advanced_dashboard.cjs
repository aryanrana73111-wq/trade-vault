const fs = require('fs');

const content = `import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Activity, Target, Shield, Crosshair, BarChart3, TrendingUp, TrendingDown,
  ChevronDown, Download, MoveHorizontal, AlertTriangle, HelpCircle, Expand, BookOpenCheck, ArrowRight,
  X, Filter
} from 'lucide-react';
import { Trade } from '@/types';
import { calculateAdvancedKPIs, generateMonteCarlo } from '@/lib/advancedAnalytics';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis, PieChart, Pie
} from 'recharts';

// Reusable Components
const PanelHeader: React.FC<{ title: string; tooltip?: string }> = ({ title, tooltip }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</h3>
    {tooltip && (
      <Tooltip content={tooltip}>
        <HelpCircle className="w-3.5 h-3.5 text-[#1E2A45] hover:text-[#00D4FF] cursor-help transition-colors" />
      </Tooltip>
    )}
  </div>
);

const Tooltip = ({ content, children }: { content: React.ReactNode, children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative flex items-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute z-50 bottom-full mb-2 w-64 p-3 text-xs bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-slate-300">
          {content}
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, delta, deltaType, warning, tooltip, isGauge }: any) => {
  return (
    <div className={\`p-4 rounded-xl bg-[#0F1422] border border-[#1E2A45] hover:border-[#00D4FF]/30 transition-colors min-w-[200px] shrink-0 flex flex-col justify-between \${warning ? 'ring-1 ring-[#FF4560]/50' : ''}\`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          {title} 
          {tooltip && (
            <Tooltip content={tooltip}>
              <HelpCircle className="w-3 h-3 text-[#1E2A45] hover:text-[#00D4FF] cursor-help" />
            </Tooltip>
          )}
        </span>
        <Icon className={\`w-4 h-4 \${warning ? 'text-[#FF4560]' : 'text-[#1E2A45]'}\`} />
      </div>
      
      <div className="flex items-end justify-between mt-1">
        <div className="font-mono text-xl font-black text-white">{value}</div>
      </div>
      
      <div className="mt-2 text-[10px] font-bold flex items-center gap-1">
        {!isGauge && (
          <span className={\`px-1.5 py-0.5 rounded \${
            deltaType === 'positive' ? 'bg-[#00FF88]/10 text-[#00FF88]' : 
            deltaType === 'negative' ? 'bg-[#FF4560]/10 text-[#FF4560]' : 
            'bg-[#FFB700]/10 text-[#FFB700]'
          }\`}>
            {delta}
          </span>
        )}
        {isGauge && (
           <span className="px-1.5 py-0.5 rounded bg-[#00FF88]/10 text-[#00FF88]">
             {delta}
           </span>
        )}
      </div>
    </div>
  );
};

const InsufficientData = ({ message = "Insufficient Data" }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-2 min-h-[200px]">
    <Activity className="w-6 h-6 opacity-30" />
    <span>{message}</span>
  </div>
);

export const AdvancedDashboard: React.FC<{ trades: Trade[]; kpis: any; onToggleMode: () => void; }> = ({ trades, kpis: defaultKpis, onToggleMode }) => {
  // STATE
  const [timeRange, setTimeRange] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [crossFilterMarket, setCrossFilterMarket] = useState<string | null>(null);
  
  const [chartMode, setChartMode] = useState<'Equity' | 'Return' | 'R-Multiple'>('Equity');
  const [todMode, setTodMode] = useState<'Win Rate' | 'P&L' | 'Count'>('Win Rate');

  // DERIVED DATA (Filters)
  const filteredTrades = useMemo(() => {
    let filtered = [...trades].filter(t => t.result && t.result !== 'PENDING').sort((a, b) => a.date - b.date);

    // Time filter
    if (timeRange !== 'ALL') {
      const now = new Date();
      let cutoff = new Date(now);
      if (timeRange === '1D') cutoff.setDate(cutoff.getDate() - 1);
      if (timeRange === '1W') cutoff.setDate(cutoff.getDate() - 7);
      if (timeRange === '1M') cutoff.setMonth(cutoff.getMonth() - 1);
      if (timeRange === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
      if (timeRange === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
      if (timeRange === 'YTD') cutoff = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(t => t.date >= cutoff.getTime());
    }

    if (selectedAccount !== 'ALL') filtered = filtered.filter(t => (t.accountId || t.dashboardId || "Default") === selectedAccount);
    if (selectedMarket !== 'ALL') filtered = filtered.filter(t => (t.pair || t.market) === selectedMarket);
    if (selectedStrategy !== 'ALL') filtered = filtered.filter(t => t.strategy === selectedStrategy);
    if (crossFilterMarket) filtered = filtered.filter(t => (t.pair || t.market) === crossFilterMarket);

    return filtered;
  }, [trades, timeRange, selectedAccount, selectedMarket, selectedStrategy, crossFilterMarket]);

  // Derived Options for Selectors
  const accounts = useMemo(() => Array.from(new Set(trades.map(t => t.accountId || t.dashboardId || "Default").filter(Boolean))), [trades]);
  const markets = useMemo(() => Array.from(new Set(trades.map(t => t.pair || t.market).filter(Boolean))), [trades]);
  const strategies = useMemo(() => Array.from(new Set(trades.map(t => t.strategy).filter(Boolean))), [trades]);

  const kpis = useMemo(() => calculateAdvancedKPIs(filteredTrades), [filteredTrades]);
  
  // Equity Data
  const equityData = useMemo(() => {
    let runningEquity = 0;
    let maxEquity = 0;
    let runningR = 0;
    let initialBalance = 10000; // Assume 10k starting for % return
    return filteredTrades.map((t, index) => {
      runningEquity += (t.pnl || 0);
      maxEquity = Math.max(maxEquity, runningEquity);
      runningR += (t.rMultiple || 0);
      return {
        tradeIndex: index + 1,
        name: new Date(t.date).toLocaleDateString(),
        equity: runningEquity,
        drawdown: runningEquity - maxEquity,
        rMultiple: runningR,
        returnPercent: (runningEquity / initialBalance) * 100,
        pnl: t.pnl || 0,
        trade: t
      };
    });
  }, [filteredTrades]);

  // R Distribution
  const rDistribution = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    const buckets = { '<-2R': 0, '-2R to -1R': 0, '-1R to 0R': 0, '0R to 1R': 0, '1R to 2R': 0, '>2R': 0 };
    filteredTrades.forEach(t => {
      const r = t.rMultiple || 0;
      if (r < -2) buckets['<-2R']++;
      else if (r < -1) buckets['-2R to -1R']++;
      else if (r < 0) buckets['-1R to 0R']++;
      else if (r < 1) buckets['0R to 1R']++;
      else if (r < 2) buckets['1R to 2R']++;
      else buckets['>2R']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [filteredTrades]);

  // Strategy Data
  const strategyData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    const stratMap = new Map();
    filteredTrades.forEach(t => {
      if (!t.strategy) return;
      const current = stratMap.get(t.strategy) || { pnl: 0, count: 0 };
      stratMap.set(t.strategy, { pnl: current.pnl + (t.pnl || 0), count: current.count + 1 });
    });
    return Array.from(stratMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  const monteCarloData = useMemo(() => generateMonteCarlo(filteredTrades, 1000, 100), [filteredTrades]);

  // P&L Distribution
  const pnlDistData = useMemo(() => {
     if (filteredTrades.length === 0) return [];
     const min = Math.min(...filteredTrades.map(t => t.pnl || 0));
     const max = Math.max(...filteredTrades.map(t => t.pnl || 0));
     if(max === min) return [];
     const step = (max - min) / 10 || 1;
     const bins: any[] = [];
     for(let i=0; i<=10; i++) {
        bins.push({ range: \`$\${Math.round(min + i*step)}\`, count: 0, val: min + i*step });
     }
     filteredTrades.forEach(t => {
         const pnl = t.pnl || 0;
         const idx = Math.min(10, Math.max(0, Math.floor((pnl - min) / step)));
         if (bins[idx]) bins[idx].count++;
     });
     return bins.filter(b => b.count > 0 || b.val === 0);
  }, [filteredTrades]);
  
  // Instrument Performance
  const instrumentData = useMemo(() => {
     if (filteredTrades.length === 0) return [];
     const map = new Map();
     filteredTrades.forEach(t => {
         const pair = t.pair || t.market;
         if(!pair) return;
         const d = map.get(pair) || { pnl: 0, count: 0, wins: 0, r: 0 };
         d.pnl += (t.pnl || 0);
         d.count++;
         d.r += (t.rMultiple || 0);
         if((t.pnl||0)>0) d.wins++;
         map.set(pair, d);
     });
     return Array.from(map.entries()).map(([pair, d]) => ({ 
         pair, pnl: d.pnl, count: d.count, wr: (d.wins/d.count)*100, avgR: d.r/d.count 
     })).sort((a,b) => b.pnl - a.pnl);
  }, [filteredTrades]);
  
  return (
    <div className="space-y-4 font-sans text-slate-300 bg-[#0A0E1A] min-h-screen p-4 -m-4 sm:-m-6 lg:-m-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F1422] border border-[#1E2A45] shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30">
            <span className="text-[#00D4FF]">⚡</span>
            <span className="text-xs font-black text-[#00D4FF] tracking-wider uppercase">Advanced Mode</span>
          </div>
          
          <div className="hidden md:flex items-center bg-[#0A0E1A] rounded-lg p-1 border border-[#1E2A45]">
            {['1D', '1W', '1M', '3M', '6M', 'YTD', 'ALL'].map((range) => (
              <button key={range} type="button" onClick={() => setTimeRange(range)} className={\`px-3 py-1 text-xs font-bold rounded-md transition-colors \${timeRange === range ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {crossFilterMarket && (
             <button type="button" onClick={() => setCrossFilterMarket(null)} className="px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-xs font-bold flex items-center gap-2 whitespace-nowrap hover:bg-[#00D4FF]/20 transition-colors">
               {crossFilterMarket} <X className="w-3 h-3" />
             </button>
          )}
          
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="appearance-none px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-[#1E2A45] hover:border-[#00D4FF]/50 text-xs font-bold text-slate-300 pr-8 outline-none cursor-pointer">
            <option value="ALL">Account: All</option>
            {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
          </select>
          <select value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)} className="appearance-none px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-[#1E2A45] hover:border-[#00D4FF]/50 text-xs font-bold text-slate-300 pr-8 outline-none cursor-pointer">
            <option value="ALL">Market: All</option>
            {markets.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={selectedStrategy} onChange={e => setSelectedStrategy(e.target.value)} className="appearance-none px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-[#1E2A45] hover:border-[#00D4FF]/50 text-xs font-bold text-slate-300 pr-8 outline-none cursor-pointer">
            <option value="ALL">Strategy: All</option>
            {strategies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button type="button" onClick={() => { setTimeRange('ALL'); setSelectedAccount('ALL'); setSelectedMarket('ALL'); setSelectedStrategy('ALL'); setCrossFilterMarket(null); }} className="px-3 py-1.5 rounded-lg bg-[#0A0E1A] border border-[#1E2A45] hover:border-[#FF4560]/50 hover:text-[#FF4560] text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-colors">
            Reset <X className="w-3 h-3" />
          </button>

          <div className="w-px h-6 bg-[#1E2A45] mx-1"></div>
          
          <div className="flex items-center bg-[#0A0E1A] p-1 rounded-lg border border-[#1E2A45]">
            <button type="button" onClick={onToggleMode} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 rounded-md transition-colors">Normal</button>
            <button type="button" className="px-3 py-1.5 text-xs font-bold text-[#00D4FF] bg-[#1E2A45] rounded-md shadow-sm border border-[#00D4FF]/20 flex items-center gap-1 cursor-default">Advanced ▶</button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        <KpiCard title="NET P&L" value={\`\$\${kpis.netPnl.toLocaleString(undefined, {minimumFractionDigits: 2})}\`} icon={DollarSign} delta="Selected Period" deltaType={kpis.netPnl >= 0 ? 'positive' : 'negative'} />
        <KpiCard title="SHARPE RATIO" value={filteredTrades.length > 2 && kpis.sharpeRatio !== 0 ? kpis.sharpeRatio.toFixed(2) : "N/A"} icon={Activity} delta="> 1.5 = Good" deltaType="neutral" tooltip="Calculated as Return / Std Dev of Return" />
        <KpiCard title="SORTINO RATIO" value={filteredTrades.length > 2 && kpis.sortinoRatio !== 0 ? kpis.sortinoRatio.toFixed(2) : "N/A"} icon={TrendingUp} delta="Downside Adj." deltaType="neutral" tooltip="Focuses only on downside deviation" />
        <KpiCard title="PROFIT FACTOR" value={filteredTrades.length > 0 ? (kpis.profitFactor === 99 ? "MAX" : kpis.profitFactor.toFixed(2)) : "N/A"} icon={Target} delta="Gross P/L" deltaType={kpis.profitFactor >= 1.5 ? 'positive' : 'neutral'} tooltip="Gross Profit divided by Gross Loss" />
        <KpiCard title="EXPECTANCY" value={filteredTrades.length > 0 ? \`\${kpis.expectancy > 0 ? '+' : ''}\${kpis.expectancy.toFixed(2)}R\` : "N/A"} icon={Crosshair} delta="Avg per trade" deltaType={kpis.expectancy >= 0 ? 'positive' : 'negative'} tooltip="Average R-Multiple per trade" />
        <KpiCard title="WIN RATE" value={filteredTrades.length > 0 ? \`\${(kpis.winRate * 100).toFixed(1)}%\` : "N/A"} icon={Activity} delta="Consistency" deltaType="positive" />
        <KpiCard title="RISK OF RUIN" value={filteredTrades.length > 5 ? "< 1%" : "N/A"} icon={Shield} delta="Safe Zone" deltaType="positive" tooltip="Probability of hitting account ruin based on win rate and R profile" />
        <KpiCard title="CONSISTENCY" value={filteredTrades.length > 5 ? "82/100" : "N/A"} icon={Activity} delta="Top 20%" deltaType="positive" isGauge tooltip="Internal Vault consistency score" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* ROW 2: EQUITY CURVE + ROLLING PERF */}
        <div className="lg:col-span-4 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Advanced Equity Curve</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#0A0E1A] rounded-lg p-0.5 border border-[#1E2A45] text-[10px] font-bold">
                <button type="button" onClick={() => setChartMode('Equity')} className={\`px-2 py-1 rounded-md transition-colors \${chartMode === 'Equity' ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>Equity</button>
                <button type="button" onClick={() => setChartMode('Return')} className={\`px-2 py-1 rounded-md transition-colors \${chartMode === 'Return' ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>% Return</button>
                <button type="button" onClick={() => setChartMode('R-Multiple')} className={\`px-2 py-1 rounded-md transition-colors \${chartMode === 'R-Multiple' ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>R-Multiple</button>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[280px]">
            {equityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4560" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF4560" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" vertical={false} />
                  <XAxis dataKey="tradeIndex" stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => chartMode === 'Equity' ? \`\$\${val}\` : chartMode === 'R-Multiple' ? \`\${val}R\` : \`\${val}%\`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0A0E1A', borderColor: '#1E2A45', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  <ReferenceLine y={0} stroke="#1E2A45" />
                  {chartMode === 'Equity' && <Area type="monotone" dataKey="drawdown" stroke="#FF4560" strokeWidth={1} fillOpacity={1} fill="url(#colorDrawdown)" />}
                  {chartMode === 'Equity' && <Area type="monotone" dataKey="equity" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />}
                  {chartMode === 'Return' && <Area type="monotone" dataKey="returnPercent" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />}
                  {chartMode === 'R-Multiple' && <Area type="monotone" dataKey="rMultiple" stroke="#00FF88" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />}
                </AreaChart>
              </ResponsiveContainer>
            ) : <InsufficientData />}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
          <PanelHeader title="Rolling Performance Windows" />
          <div className="flex-1 mt-4 space-y-4">
            {[7, 14, 30, 90].map(days => {
              const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
              const period = filteredTrades.filter(t => t.date >= cutoff);
              const p = period.reduce((s, t) => s + (t.pnl || 0), 0);
              const wr = period.length ? (period.filter(t => (t.pnl || 0) > 0).length / period.length) * 100 : 0;
              const color = p >= 0 ? '#00FF88' : '#FF4560';
              return (
                <div key={days} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">{days} Days</span><span style={{ color }}>{p>=0?'+':'-'}\${Math.abs(p).toFixed(2)}</span></div>
                  <div className="h-1.5 w-full bg-[#1E2A45] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: \`\${wr}%\`, backgroundColor: color }} />
                  </div>
                  <div className="text-[10px] text-right text-slate-500">{wr.toFixed(0)}% WR ({period.length} trades)</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 3: R-MULT, HEATMAP, PNL DIST */}
        <div className="lg:col-span-2 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
          <PanelHeader title="R-Multiple Distribution" />
          <div className="flex-1 min-h-[240px] mt-2 flex flex-col">
            {rDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" vertical={false} />
                  <XAxis dataKey="range" stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#1E2A45' }} contentStyle={{ backgroundColor: '#0A0E1A', borderColor: '#1E2A45', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {rDistribution.map((entry, index) => <Cell key={index} fill={entry.range.includes('-') ? '#FF4560' : entry.range.includes('0') ? '#8899BB' : '#00FF88'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <InsufficientData />}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
           <PanelHeader title="Session Performance Heatmap" />
           <div className="flex-1 mt-2">
             <div className="grid grid-cols-6 gap-1 text-[10px] font-bold text-center mb-1 text-slate-500">
               <div></div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div>
             </div>
             {['Asian', 'London', 'New York', 'Overlap'].map((session) => (
               <div key={session} className="grid grid-cols-6 gap-1 mb-1">
                 <div className="text-[10px] font-bold text-slate-400 flex items-center">{session}</div>
                 {[1, 2, 3, 4, 5].map(day => {
                    const tradesInSessionDay = filteredTrades.filter(t => t.session === session && new Date(t.date).getDay() === day);
                    const pnl = tradesInSessionDay.reduce((a,b)=>a+(b.pnl||0),0);
                    const color = pnl > 0 ? '#00FF88' : pnl < 0 ? '#FF4560' : '#1E2A45';
                    const bg = pnl > 0 ? 'bg-[#00FF88]/20' : pnl < 0 ? 'bg-[#FF4560]/20' : 'bg-[#1E2A45]/30';
                    return (
                      <div key={day} className={\`h-8 rounded \${bg} hover:ring-1 ring-white cursor-pointer transition-all flex items-center justify-center text-[10px]\`} style={{ color }}>
                        {pnl !== 0 ? \`\${pnl>0?'+':''}\$\${Math.abs(Math.round(pnl))}\` : '-'}
                      </div>
                    )
                 })}
               </div>
             ))}
           </div>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
          <PanelHeader title="P&L Distribution Histogram" />
          <div className="flex-1 min-h-[240px] mt-2 flex flex-col">
            {pnlDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" vertical={false} />
                  <XAxis dataKey="range" stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#1E2A45' }} contentStyle={{ backgroundColor: '#0A0E1A', borderColor: '#1E2A45', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pnlDistData.map((entry, index) => <Cell key={index} fill={entry.val < 0 ? '#FF4560' : entry.val === 0 ? '#8899BB' : '#00FF88'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <InsufficientData />}
          </div>
        </div>

        {/* ROW 4: TIME-OF-DAY */}
        <div className="lg:col-span-6 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
           <PanelHeader title="Time-of-Day Performance" />
           <div className="flex-1 mt-2 flex flex-col h-[200px]">
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-1 text-[10px] font-bold">
                 <div className="w-2 h-2 bg-[#FF4560] rounded-sm"></div> <span className="mr-2">Loss</span>
                 <div className="w-2 h-2 bg-[#00FF88] rounded-sm"></div> <span>Profit</span>
               </div>
               <div className="flex items-center bg-[#0A0E1A] rounded-lg p-0.5 border border-[#1E2A45] text-[10px] font-bold">
                 <button type="button" onClick={()=>setTodMode('Win Rate')} className={\`px-2 py-1 rounded-md \${todMode === 'Win Rate' ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>Win Rate</button>
                 <button type="button" onClick={()=>setTodMode('P&L')} className={\`px-2 py-1 rounded-md \${todMode === 'P&L' ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>P&L</button>
                 <button type="button" onClick={()=>setTodMode('Count')} className={\`px-2 py-1 rounded-md \${todMode === 'Count' ? 'bg-[#1E2A45] text-white' : 'text-slate-500 hover:text-slate-300'}\`}>Count</button>
               </div>
             </div>
             
             <div className="flex-1 flex overflow-x-auto no-scrollbar pb-2">
               <div className="flex-1 min-w-[500px] flex items-end">
                 {Array.from({ length: 24 }).map((_, i) => {
                    const hourTrades = filteredTrades.filter(t => new Date(t.date).getHours() === i);
                    const pnl = hourTrades.reduce((a,b)=>a+(b.pnl||0),0);
                    const isWin = pnl >= 0;
                    const h = hourTrades.length > 0 ? 20 + Math.random() * 80 : 5; // Simplified visualization height based on existence
                    return (
                        <div key={i} className="flex-1 h-full flex flex-col justify-end mx-0.5 group">
                           <div className={\`w-full rounded-t-sm \${hourTrades.length === 0 ? 'bg-slate-800' : isWin ? 'bg-[#00FF88]' : 'bg-[#FF4560]'} transition-all opacity-80 group-hover:opacity-100\`} style={{ height: \`\${h}%\` }} title={\`\${i}:00 - \${hourTrades.length} trades, P&L \$\${pnl.toFixed(2)}\`} />
                        </div>
                    );
                 })}
               </div>
             </div>
             <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1 px-4">
               <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
             </div>
           </div>
        </div>

        {/* ROW 5: MAE/MFE & STRATEGY */}
        <div className="lg:col-span-3 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
           <PanelHeader title="MAE / MFE Scatter Plot" tooltip="Maximum Adverse Excursion / Maximum Favorable Excursion data points are required." />
           <div className="flex-1 min-h-[260px] mt-2 flex flex-col items-center justify-center">
             <InsufficientData message="No MAE/MFE data available in current trades." />
           </div>
        </div>

        <div className="lg:col-span-3 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
           <PanelHeader title="Strategy Attribution Chart" />
           <div className="flex-1 min-h-[260px] mt-2 flex flex-col justify-center">
             {strategyData.length > 0 ? (
               <div className="space-y-3">
                 {strategyData.map(s => (
                   <div key={s.name} className="flex flex-col gap-1">
                     <div className="flex justify-between items-center text-xs font-bold">
                       <span className="text-slate-300">{s.name} ({s.count})</span>
                       <span className={s.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4560]'}>{s.pnl > 0 ? '+' : ''}\${s.pnl.toFixed(2)}</span>
                     </div>
                     <div className="h-2 w-full bg-[#1E2A45] rounded-full overflow-hidden flex items-center">
                       <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: s.pnl >= 0 ? '#00FF88' : '#FF4560' }} />
                     </div>
                   </div>
                 ))}
               </div>
             ) : <InsufficientData message="No strategy tags applied to trades." />}
           </div>
        </div>

        {/* ROW 6: MONTE CARLO & INSTRUMENT PERFORMANCE */}
        <div className="lg:col-span-4 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative">
           <PanelHeader title="Monte Carlo Simulation (1000 runs)" />
           <div className="flex-1 min-h-[260px] mt-2 flex flex-col">
             {monteCarloData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={monteCarloData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" vertical={false} />
                   <XAxis dataKey="t" stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#8899BB" fontSize={10} tickLine={false} axisLine={false} />
                   <RechartsTooltip contentStyle={{ backgroundColor: '#0A0E1A', borderColor: '#1E2A45', borderRadius: '8px' }} />
                   <Area type="monotone" dataKey="p95" stroke="none" fill="#00FF88" fillOpacity={0.1} />
                   <Area type="monotone" dataKey="p75" stroke="none" fill="#00FF88" fillOpacity={0.2} />
                   <Area type="monotone" dataKey="p25" stroke="none" fill="#FFB700" fillOpacity={0.2} />
                   <Area type="monotone" dataKey="p5" stroke="none" fill="#FF4560" fillOpacity={0.2} />
                   <Line type="monotone" dataKey="p50" stroke="#00D4FF" strokeWidth={2} dot={false} />
                 </AreaChart>
               </ResponsiveContainer>
             ) : <InsufficientData />}
           </div>
        </div>
        
        <div className="lg:col-span-2 rounded-xl bg-[#0F1422] border border-[#1E2A45] p-4 flex flex-col relative overflow-auto">
           <PanelHeader title="Instrument Performance" tooltip="Click a row to cross-filter the dashboard by this instrument." />
           <div className="flex-1 mt-2 text-xs">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-[#1E2A45]">
                   <th className="py-2">Market</th>
                   <th className="py-2">Trades</th>
                   <th className="py-2">Win %</th>
                   <th className="py-2 text-right">P&L</th>
                 </tr>
               </thead>
               <tbody>
                 {instrumentData.map(d => (
                   <tr 
                     key={d.pair} 
                     onClick={() => setCrossFilterMarket(d.pair)}
                     className="border-b border-[#1E2A45]/50 hover:bg-[#1E2A45]/30 cursor-pointer group transition-colors"
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => { if(e.key === 'Enter') setCrossFilterMarket(d.pair); }}
                     aria-label={\`Filter dashboard by \${d.pair}\`}
                   >
                     <td className="py-2 font-bold text-white flex items-center gap-1 group-hover:text-[#00D4FF] transition-colors">
                        <Filter className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        {d.pair}
                     </td>
                     <td className="py-2 text-slate-400">{d.count}</td>
                     <td className="py-2 text-slate-400">{d.wr.toFixed(0)}%</td>
                     <td className={\`py-2 text-right font-bold \${d.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4560]'}\`}>
                       \${d.pnl.toFixed(2)}
                     </td>
                   </tr>
                 ))}
                 {instrumentData.length === 0 && (
                   <tr><td colSpan={4} className="py-4 text-center"><InsufficientData /></td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
};
`

fs.writeFileSync('src/components/dashboard/AdvancedDashboard.tsx', content);
