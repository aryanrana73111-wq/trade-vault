import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Strategy, Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StrategyRobustnessTab } from '@/components/strategies/StrategyRobustnessTab';
import { StrategyVersionsTab } from '@/components/strategies/StrategyVersionsTab';
import { calculateKPIs } from '@/lib/calculations';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { ArrowLeft, Edit, Activity, Target, TrendingUp, DollarSign, Crosshair, TrendingDown, Scale, BarChart2, CheckCircle2, AlertCircle, Play, History, List, X, Flame, Globe2, Sparkles, Newspaper, Info } from 'lucide-react';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { EventDetailModal } from '@/components/news/EventDetailModal';
import { NewsEvent } from '@/types/newsIntelligence';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function StatCard({ title, value, icon, trend, tooltip }: { title: string, value: string, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral', tooltip?: string }) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between h-[120px]">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" title={tooltip}>{title}</span>
        <div className="p-1.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
      </div>
    </Card>
  );
}

export default function StrategyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trades: rawTrades, strategies, updateStrategy } = useData();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'performance' | 'rules' | 'robustness' | 'versions' | 'history'>('performance');
  const [inspectEvent, setInspectEvent] = useState<NewsEvent | null>(null);

  useEffect(() => {
    const found = strategies.find(s => s.id === id);
    if (found) {
      setStrategy(found);
      
      const allTrades = [...rawTrades].sort((a, b) => a.date - b.date);
      // Link logic (string match by name or id)
      setTrades(allTrades.filter(t => t.strategy === found.name || t.strategy === found.id));
    } else {
      if (strategies.length > 0) navigate('/strategies');
    }
  }, [id, navigate, strategies, rawTrades]);

  const kpis = useMemo(() => calculateKPIs(trades), [trades]);

  const strategyMacroStats = useMemo(() => {
    const newsTrades = trades.filter(t => Boolean(t.newsEventId || t.newsEventName));
    const nonNewsTrades = trades.filter(t => !t.newsEventId && !t.newsEventName);

    const calcSubset = (list: Trade[]) => {
      const closed = list.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
      const wins = closed.filter(t => t.result === 'WIN');
      const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
      const netPnl = closed.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossLoss = Math.abs(closed.filter(t => t.result === 'LOSS').reduce((acc, t) => acc + (t.pnl || 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);
      const avgR = closed.length > 0 ? closed.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / closed.length : 0;
      return { count: list.length, closedCount: closed.length, winRate, netPnl, profitFactor, avgR, trades: list };
    };

    return {
      news: calcSubset(newsTrades),
      nonNews: calcSubset(nonNewsTrades),
      recentCatalysts: newsTrades.slice(-6).reverse()
    };
  }, [trades]);

  const equityData = useMemo(() => {
    let runningEquity = 0;
    return trades.filter(t => t.result && t.result !== 'PENDING').map(t => {
      runningEquity += (t.pnl || 0);
      return {
        name: format(new Date(t.date), 'MMM dd'),
        equity: runningEquity,
        trade: t
      };
    });
  }, [trades]);

  if (!strategy) return null;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/strategies')} className="p-1 -ml-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{strategy.name}</h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
              strategy.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/60 text-slate-400 border border-white/[0.08]'
            )}>
              {strategy.status}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base max-w-3xl">
            {strategy.detailedDescription || strategy.shortDescription}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={() => navigate(`/journal?strategy=${encodeURIComponent(strategy.name)}`)} className="gap-2">
            <BarChart2 className="w-4 h-4" /> View in Journal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-white/[0.08] overflow-x-auto">
        <button 
          onClick={() => setActiveTab('performance')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 transition-colors shrink-0", activeTab === 'performance' ? "border-blue-500 text-blue-500 dark:text-blue-400 font-semibold" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")}
        >
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Performance</div>
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 transition-colors shrink-0", activeTab === 'rules' ? "border-blue-500 text-blue-500 dark:text-blue-400 font-semibold" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")}
        >
          <div className="flex items-center gap-2"><List className="w-4 h-4" /> Rules & Playbook</div>
        </button>
        <button 
          onClick={() => setActiveTab('robustness')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 transition-colors shrink-0", activeTab === 'robustness' ? "border-blue-500 text-blue-500 dark:text-blue-400 font-semibold" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")}
        >
          <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Robustness</div>
        </button>
        <button 
          onClick={() => setActiveTab('versions')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 transition-colors shrink-0", activeTab === 'versions' ? "border-blue-500 text-blue-500 dark:text-blue-400 font-semibold" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")}
        >
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Versions</div>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn("px-5 py-3 text-sm font-medium border-b-2 transition-colors shrink-0", activeTab === 'history' ? "border-blue-500 text-blue-500 dark:text-blue-400 font-semibold" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200")}
        >
          <div className="flex items-center gap-2"><History className="w-4 h-4" /> Trade History</div>
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {trades.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center border-dashed">
              <Activity className="w-8 h-8 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">Strategy created, but no trades are linked yet.</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Record a trade using this strategy to see performance analytics.</p>
              <Button onClick={() => navigate('/add')}>Add Trade</Button>
            </div>
          ) : (
            <>
              {/* Sample Size Warning */}
              {kpis.closedTradesCount < 20 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 backdrop-blur-xs">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-200">
                      {kpis.closedTradesCount === 0 ? 'No closed trades' : (kpis.closedTradesCount < 5 ? 'Very limited data' : 'Early data — interpret cautiously')}
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-300/80 mt-1">
                      This strategy has only {kpis.closedTradesCount} closed {kpis.closedTradesCount === 1 ? 'trade' : 'trades'}. 
                      More observations are needed before meaningful performance conclusions can be drawn.
                    </p>
                  </div>
                </div>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                <StatCard title="Trades" value={kpis.totalTrades.toString()} icon={<Activity className="w-4 h-4" />} trend="neutral" />
                <StatCard title="Win Rate" value={kpis.closedTradesCount > 0 ? `${formatNumber(kpis.winRate, 1)}%` : '--'} icon={<Target className="w-4 h-4" />} trend={kpis.winRate >= 50 ? 'up' : 'down'} />
                <StatCard title="Net P&L" value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.netPnl) : '--'} icon={<DollarSign className="w-4 h-4" />} trend={kpis.netPnl >= 0 ? 'up' : 'down'} />
                <StatCard title="Profit Factor" value={kpis.closedTradesCount > 0 ? (kpis.profitFactor === Infinity ? '∞' : formatNumber(kpis.profitFactor, 2)) : '--'} icon={<TrendingUp className="w-4 h-4" />} trend={kpis.profitFactor >= 1 ? 'up' : 'down'} />
                <StatCard title="Expectancy" value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.expectancy) : '--'} icon={<Crosshair className="w-4 h-4" />} trend={kpis.expectancy >= 0 ? 'up' : 'down'} />
                <StatCard title="Average R" value={kpis.closedTradesCount > 0 ? `${formatNumber(kpis.averageR, 2)}R` : '--'} icon={<Target className="w-4 h-4" />} trend={kpis.averageR > 0 ? 'up' : 'down'} />
                <StatCard title="Max DD" value={kpis.maxDrawdown > 0 ? `-${formatCurrency(kpis.maxDrawdown)}` : '--'} icon={<TrendingDown className="w-4 h-4" />} trend="down" />
                <StatCard title="Avg Risk" value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.averageRisk) : '--'} icon={<Scale className="w-4 h-4" />} trend="neutral" />
              </div>

              {/* Equity Curve */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Strategy Equity Curve</h3>
                <div className="h-[350px] w-full">
                  {equityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `$${val}`} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }} formatter={(value: number) => [formatCurrency(value), 'Equity']} />
                        <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      Not enough closed trades to generate an equity curve.
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Macro Catalyst Performance Breakdown for this Strategy */}
              <Card className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Macro Catalyst Strategy Performance</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Observing how {strategy.name} executes across scheduled news releases versus standard market sessions.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-white/[0.08] font-medium self-start sm:self-auto">
                    Empirical Observational • Non-Causal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* News Trades */}
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/10 backdrop-blur-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                          News Catalyst Trades
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {strategyMacroStats.news.count} trades
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="glass-panel p-2.5 rounded-lg border border-purple-500/20">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Win Rate</div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {strategyMacroStats.news.closedCount > 0 ? `${formatNumber(strategyMacroStats.news.winRate, 1)}%` : '--'}
                        </div>
                      </div>
                      <div className="glass-panel p-2.5 rounded-lg border border-purple-500/20">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Net P&L</div>
                        <div className={cn(
                          "text-base font-bold mt-0.5",
                          strategyMacroStats.news.netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {strategyMacroStats.news.closedCount > 0 ? formatCurrency(strategyMacroStats.news.netPnl) : '--'}
                        </div>
                      </div>
                      <div className="glass-panel p-2.5 rounded-lg border border-purple-500/20">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Profit Factor</div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {strategyMacroStats.news.closedCount > 0 ? formatNumber(strategyMacroStats.news.profitFactor, 2) : '--'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Standard Non-News Trades */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/50 dark:bg-slate-900/40 backdrop-blur-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Standard Market Sessions
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 border border-white/[0.08]">
                        {strategyMacroStats.nonNews.count} trades
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="glass-panel p-2.5 rounded-lg border border-white/[0.08]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Win Rate</div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {strategyMacroStats.nonNews.closedCount > 0 ? `${formatNumber(strategyMacroStats.nonNews.winRate, 1)}%` : '--'}
                        </div>
                      </div>
                      <div className="glass-panel p-2.5 rounded-lg border border-white/[0.08]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Net P&L</div>
                        <div className={cn(
                          "text-base font-bold mt-0.5",
                          strategyMacroStats.nonNews.netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {strategyMacroStats.nonNews.closedCount > 0 ? formatCurrency(strategyMacroStats.nonNews.netPnl) : '--'}
                        </div>
                      </div>
                      <div className="glass-panel p-2.5 rounded-lg border border-white/[0.08]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Profit Factor</div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {strategyMacroStats.nonNews.closedCount > 0 ? formatNumber(strategyMacroStats.nonNews.profitFactor, 2) : '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked News Catalysts List */}
                {strategyMacroStats.recentCatalysts.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Recent Catalysts Traded Under This Strategy
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {strategyMacroStats.recentCatalysts.map(t => {
                        const matchedEv = NEWS_EVENTS.find(e => e.id === t.newsEventId || e.name.toLowerCase() === (t.newsEventName || '').toLowerCase());
                        return (
                          <div 
                            key={t.id} 
                            className="p-2.5 rounded-lg glass-panel border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-2 text-xs hover:border-blue-500/40 transition-colors cursor-pointer"
                            onClick={() => matchedEv && setInspectEvent(matchedEv)}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="shrink-0">{matchedEv?.countryCode === 'US' ? '🇺🇸' : matchedEv?.countryCode === 'EU' ? '🇪🇺' : '🌐'}</span>
                              <div className="truncate">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{t.newsEventName || matchedEv?.name || 'Catalyst'}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{format(new Date(t.date), 'MMM dd')} • {t.market}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={cn(
                                "font-bold text-xs",
                                (t.pnl || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                              )}>
                                {(t.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(t.pnl || 0)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-white/[0.06] pb-2">Entry Conditions</h3>
              {strategy.entryRules.length > 0 ? (
                <ul className="space-y-3">
                  {strategy.entryRules.map((rule, idx) => (
                    <li key={rule.id} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-400 mt-0.5">{idx + 1}.</span>
                      <span>{rule.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No entry rules defined.</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-white/[0.06] pb-2">Invalidation Conditions</h3>
              {strategy.invalidationRules.length > 0 ? (
                <ul className="space-y-3">
                  {strategy.invalidationRules.map(rule => (
                    <li key={rule.id} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <X className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <span>{rule.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No invalidation conditions defined.</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-white/[0.06] pb-2">Exit Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Take Profit</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{strategy.exitRules.takeProfitLogic || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stop Loss</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{strategy.exitRules.stopLossLogic || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Partials</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{strategy.exitRules.partialExitRules || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Trailing</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{strategy.exitRules.trailingStopRules || 'Not specified'}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-white/[0.06] pb-2">Pre-Trade Checklist</h3>
              {strategy.checklist.length > 0 ? (
                <div className="space-y-3">
                  {strategy.checklist.map(item => (
                    <div key={item.id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded shrink-0 mt-0.5 bg-slate-800/40"></div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No checklist defined.</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-white/[0.06] pb-2">Risk Parameters</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Default Risk:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{strategy.riskRules.defaultRisk ? `$${strategy.riskRules.defaultRisk}` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Max Risk:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{strategy.riskRules.maxRisk ? `$${strategy.riskRules.maxRisk}` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Min R:R:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{strategy.riskRules.minRR ? `${strategy.riskRules.minRR}R` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Max Trades/Day:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{strategy.riskRules.maxTradesPerDay || 'Not set'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-white/[0.06] pb-2">Environment</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Markets</span>
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.markets.map((m, idx) => <span key={`strat-det-mkt-${m}-${idx}`} className="px-2 py-0.5 bg-slate-800/60 border border-white/[0.08] text-slate-300 text-xs rounded-md">{m}</span>)}
                    {strategy.markets.length === 0 && <span className="text-sm text-slate-400 italic">Any</span>}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Sessions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.sessions.map(s => <span key={s} className="px-2 py-0.5 bg-slate-800/60 border border-white/[0.08] text-slate-300 text-xs rounded-md">{s}</span>)}
                    {strategy.sessions.length === 0 && <span className="text-sm text-slate-400 italic">Any</span>}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Timeframes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.timeframes.map(t => <span key={t} className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-md">{t}</span>)}
                    {strategy.timeframes.length === 0 && <span className="text-sm text-slate-400 italic">Any</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'robustness' && (
        <StrategyRobustnessTab strategy={strategy} trades={trades} />
      )}

      {activeTab === 'versions' && (
        <StrategyVersionsTab strategy={strategy} />
      )}

      {activeTab === 'history' && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 dark:border-white/[0.08]">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Trade History</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All {trades.length} trades recorded using {strategy.name}.</p>
          </div>
          {trades.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">No trades recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200/80 dark:border-white/[0.08]">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Market</th>
                    <th className="px-6 py-3">Direction</th>
                    <th className="px-6 py-3 text-right">R:R</th>
                    <th className="px-6 py-3 text-right">Result</th>
                    <th className="px-6 py-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {trades.slice().reverse().map(trade => (
                    <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{format(new Date(trade.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">{trade.market}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold", trade.direction === 'BUY' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30')}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600 dark:text-slate-400">{trade.rrRatio ? `1:${trade.rrRatio}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        {trade.result === 'WIN' && <span className="text-emerald-400 font-bold">WIN</span>}
                        {trade.result === 'LOSS' && <span className="text-rose-400 font-bold">LOSS</span>}
                        {trade.result === 'BREAK EVEN' && <span className="text-slate-400">BE</span>}
                        {trade.result === 'PENDING' && <span className="text-amber-400">PENDING</span>}
                        {!trade.result && <span className="text-slate-400">-</span>}
                      </td>
                      <td className={cn("px-6 py-4 whitespace-nowrap text-right font-bold", trade.pnl && trade.pnl > 0 ? "text-emerald-400" : (trade.pnl && trade.pnl < 0 ? "text-rose-400" : "text-slate-900 dark:text-slate-100"))}>
                        {trade.pnl ? (trade.pnl > 0 ? '+' : '') + formatCurrency(trade.pnl) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {inspectEvent && (
        <EventDetailModal
          event={inspectEvent}
          onClose={() => setInspectEvent(null)}
          timezone="UTC"
        />
      )}
    </div>
  );
}
