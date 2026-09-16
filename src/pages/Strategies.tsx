import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Strategy, Trade } from '@/types';
import { Card, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { calculateKPIs } from '@/lib/calculations';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Search, Plus, MoreVertical, FileText, ArrowRight, Activity, Archive, LayoutTemplate, BookOpen, Sparkles, Scale, Sliders } from 'lucide-react';
import { RecommendedStrategiesView } from '@/components/strategy/RecommendedStrategiesView';
import { StrategyResearchView } from '@/components/strategy/StrategyResearchView';
import { RECOMMENDED_STRATEGIES } from '@/data/strategyResearchLibrary';

export default function Strategies() {
  const navigate = useNavigate();
  const { trades: rawTrades, strategies: rawStrategies, updateStrategy, deleteStrategy } = useData();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const validStratTabs = ['custom', 'recommended', 'research'] as const;
  type StratTabType = typeof validStratTabs[number];
  const urlStratTab = searchParams.get('tab') as StratTabType | null;
  const [activeMainTab, setActiveMainTab] = useState<StratTabType>(
    urlStratTab && validStratTabs.includes(urlStratTab) ? urlStratTab : 'custom'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as StratTabType | null;
    if (tab && validStratTabs.includes(tab)) {
      setActiveMainTab(tab);
    }
  }, [searchParams]);

  const handleStratTabChange = (tab: StratTabType) => {
    setActiveMainTab(tab);
    setSearchParams({ tab });
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Archived' | 'All'>('Active');
  const [sortOption, setSortOption] = useState<'Name' | 'Most Trades' | 'Win Rate' | 'Net P&L' | 'Expectancy' | 'Recently Updated'>('Recently Updated');

  useEffect(() => {
    setStrategies(Array.from(new Map(rawStrategies.map(s => [s.id, s])).values()));
    setTrades(Array.from(new Map(rawTrades.map(t => [t.id, t])).values()));
  }, [rawStrategies, rawTrades]);

  const handleUpdateStatus = async (id: string, newStatus: 'Active' | 'Archived') => {
    await updateStrategy(id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this strategy? This will not delete the historical trades, but they may lose their reference name if you used ID binding. Archiving is recommended instead.")) {
      await deleteStrategy(id);
    }
  };

  // Compute metrics for each strategy
  const strategyMetrics = useMemo(() => {
    const metricsMap = new Map<string, any>();
    strategies.forEach(strategy => {
      // Find trades using this strategy. 
      // The old trades just use string matching for strategy name.
      const strategyTrades = trades.filter(t => t.strategy === strategy.name || t.strategy === strategy.id);
      const kpis = calculateKPIs(strategyTrades);
      metricsMap.set(strategy.id, {
        kpis,
        lastTradeDate: strategyTrades.length > 0 ? Math.max(...strategyTrades.map(t => t.date)) : null
      });
    });
    return metricsMap;
  }, [strategies, trades]);

  const filteredAndSortedStrategies = useMemo(() => {
    let result = strategies.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const metricsA = strategyMetrics.get(a.id)?.kpis;
      const metricsB = strategyMetrics.get(b.id)?.kpis;
      
      switch (sortOption) {
        case 'Name': return a.name.localeCompare(b.name);
        case 'Most Trades': return (metricsB?.closedTradesCount || 0) - (metricsA?.closedTradesCount || 0);
        case 'Win Rate': return (metricsB?.winRate || 0) - (metricsA?.winRate || 0);
        case 'Net P&L': return (metricsB?.netPnl || 0) - (metricsA?.netPnl || 0);
        case 'Expectancy': return (metricsB?.expectancy || 0) - (metricsA?.expectancy || 0);
        case 'Recently Updated': 
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

    return result;
  }, [strategies, strategyMetrics, searchTerm, statusFilter, sortOption]);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Strategy Research Lab</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-base">
            Build, document, test, and evaluate institutional-grade trading strategies and market playbooks.
          </p>
        </div>
        {activeMainTab === 'custom' && (
          <Button onClick={() => navigate('/strategies/create')} size="lg" className="shrink-0 gap-2">
            <Plus className="w-5 h-5" /> Create Strategy
          </Button>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => handleStratTabChange('custom')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
            activeMainTab === 'custom'
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          )}
        >
          <LayoutTemplate className="w-4 h-4" /> My Strategies ({strategies.length})
        </button>

        <button
          onClick={() => handleStratTabChange('recommended')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
            activeMainTab === 'recommended'
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          )}
        >
          <BookOpen className="w-4 h-4" /> Recommended Strategies ({RECOMMENDED_STRATEGIES.length})
        </button>

        <button
          onClick={() => handleStratTabChange('research')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
            activeMainTab === 'research'
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          )}
        >
          <Sparkles className="w-4 h-4" /> Market Playbooks & Research Lab
        </button>
      </div>

      {activeMainTab === 'recommended' && (
        <RecommendedStrategiesView />
      )}

      {activeMainTab === 'research' && (
        <StrategyResearchView />
      )}

      {activeMainTab === 'custom' && (
        <>
          <Card className="p-4 shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search strategies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                  <option value="All">All Statuses</option>
                </select>

                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Recently Updated">Recently Updated</option>
                  <option value="Name">Name</option>
                  <option value="Most Trades">Most Trades</option>
                  <option value="Win Rate">Win Rate</option>
                  <option value="Net P&L">Net P&L</option>
                  <option value="Expectancy">Expectancy</option>
                </select>
              </div>
            </div>
          </Card>

          {filteredAndSortedStrategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-850/50">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mb-5">
                <LayoutTemplate className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">No custom strategies yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                Create your first strategy or explore the Recommended Strategies library.
              </p>
              <Button onClick={() => navigate('/strategies/create')}>
                <Plus className="w-4 h-4 mr-2" /> Create Strategy
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredAndSortedStrategies.map(strategy => {
                const metrics = strategyMetrics.get(strategy.id);
                const kpis = metrics?.kpis;
                const hasData = kpis && kpis.closedTradesCount > 0;
                
                return (
                  <Card key={strategy.id} className="flex flex-col shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow overflow-hidden bg-white dark:bg-slate-900">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{strategy.name}</h3>
                          {strategy.status === 'Archived' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="relative group">
                          <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-1">
                            <button onClick={() => navigate(`/strategies/${strategy.id}?edit=true`)} className="px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Edit Strategy</button>
                            <button onClick={() => handleUpdateStatus(strategy.id, strategy.status === 'Active' ? 'Archived' : 'Active')} className="px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {strategy.status === 'Active' ? 'Archive' : 'Unarchive'} Strategy
                            </button>
                            <button onClick={() => handleDelete(strategy.id)} className="px-4 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-950 text-red-600">Delete Strategy</button>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">{strategy.shortDescription}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {strategy.markets.slice(0, 3).map(m => (
                          <span key={m} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md">{m}</span>
                        ))}
                        {strategy.markets.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md">+{strategy.markets.length - 3}</span>
                        )}
                        
                        {strategy.timeframes.slice(0, 2).map(t => (
                          <span key={t} className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md">{t}</span>
                        ))}
                      </div>

                      <div className="mt-auto grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-xs text-slate-500 font-medium mb-1">Win Rate</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{hasData ? `${formatNumber(kpis.winRate, 1)}%` : '--'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium mb-1">Net P&L</div>
                          <div className={cn("font-semibold", hasData ? (kpis.netPnl > 0 ? 'text-green-600' : 'text-red-600') : 'text-slate-900 dark:text-slate-100')}>
                            {hasData ? (kpis.netPnl > 0 ? '+' : '') + formatCurrency(kpis.netPnl) : '--'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium mb-1">Trades</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{hasData ? kpis.totalTrades : '--'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-850/50 flex justify-between items-center">
                      <div className="text-xs text-slate-500">
                        {metrics?.lastTradeDate ? `Last trade: ${new Date(metrics.lastTradeDate).toLocaleDateString()}` : 'No trades yet'}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/strategies/${strategy.id}`)} className="gap-1.5">
                        View <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Educational Disclaimer */}
      <div className="mt-16 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          An important reminder
        </h3>
        <p className="text-sm text-blue-800/80 leading-relaxed max-w-4xl">
          Strategy cannot make you profitable. A strategy is only a framework for making trading decisions. 
          Profitability depends on execution, risk management, market conditions, discipline, psychology, costs, 
          and a large sample of trades. Historical performance does not guarantee future results.
          <br /><br />
          Use TradeVault to study your own data, test your assumptions, and improve your process — not to chase a guaranteed winning strategy.
        </p>
      </div>
    </div>
  );
}
