import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Strategy, Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { calculateKPIs } from '@/lib/calculations';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { ArrowLeft, Edit, Activity, Target, TrendingUp, DollarSign, Crosshair, TrendingDown, Scale, BarChart2, CheckCircle2, AlertCircle, Play, History, List, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function StatCard({ title, value, icon, trend, tooltip }: { title: string, value: string, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral', tooltip?: string }) {
  return (
    <Card className="p-5 shadow-sm border-slate-200 flex flex-col justify-between h-[120px] bg-white">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider" title={tooltip}>{title}</span>
        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
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
  const [activeTab, setActiveTab] = useState<'performance' | 'rules' | 'history'>('performance');

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
            <button onClick={() => navigate('/strategies')} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{strategy.name}</h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
              strategy.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            )}>
              {strategy.status}
            </span>
          </div>
          <p className="text-slate-500 mt-1.5 text-base max-w-3xl">
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
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('performance')}
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'performance' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Performance</div>
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'rules' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          <div className="flex items-center gap-2"><List className="w-4 h-4" /> Rules & Playbook</div>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'history' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          <div className="flex items-center gap-2"><History className="w-4 h-4" /> Trade History</div>
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {trades.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
              <Activity className="w-8 h-8 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">Strategy created, but no trades are linked yet.</h3>
              <p className="text-sm text-slate-500 mb-6">Record a trade using this strategy to see performance analytics.</p>
              <Button onClick={() => navigate('/add')}>Add Trade</Button>
            </div>
          ) : (
            <>
              {/* Sample Size Warning */}
              {kpis.closedTradesCount < 20 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      {kpis.closedTradesCount === 0 ? 'No closed trades' : (kpis.closedTradesCount < 5 ? 'Very limited data' : 'Early data — interpret cautiously')}
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This strategy has only {kpis.closedTradesCount} closed {kpis.closedTradesCount === 1 ? 'trade' : 'trades'}. 
                      More observations are needed before meaningful performance conclusions can be drawn.
                    </p>
                  </div>
                </div>
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
              <Card className="p-6 shadow-sm border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Strategy Equity Curve</h3>
                <div className="h-[350px] w-full">
                  {equityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [formatCurrency(value), 'Equity']} />
                        <Line type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      Not enough closed trades to generate an equity curve.
                    </div>
                  )}
                </div>
              </Card>
              
              <div className="opacity-50 text-center py-8">
                <p className="text-sm text-slate-500">More detailed breakdown (Market, Session, Emotion) can be built in the next step.</p>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-sm border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Entry Conditions</h3>
              {strategy.entryRules.length > 0 ? (
                <ul className="space-y-3">
                  {strategy.entryRules.map((rule, idx) => (
                    <li key={rule.id} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-400 mt-0.5">{idx + 1}.</span>
                      <span>{rule.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No entry rules defined.</p>
              )}
            </Card>

            <Card className="p-6 shadow-sm border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Invalidation Conditions</h3>
              {strategy.invalidationRules.length > 0 ? (
                <ul className="space-y-3">
                  {strategy.invalidationRules.map(rule => (
                    <li key={rule.id} className="flex items-start gap-3 text-sm text-slate-700">
                      <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>{rule.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No invalidation conditions defined.</p>
              )}
            </Card>

            <Card className="p-6 shadow-sm border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Exit Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Take Profit</h4>
                  <p className="text-sm text-slate-700">{strategy.exitRules.takeProfitLogic || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stop Loss</h4>
                  <p className="text-sm text-slate-700">{strategy.exitRules.stopLossLogic || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Partials</h4>
                  <p className="text-sm text-slate-700">{strategy.exitRules.partialExitRules || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Trailing</h4>
                  <p className="text-sm text-slate-700">{strategy.exitRules.trailingStopRules || 'Not specified'}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 shadow-sm border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Pre-Trade Checklist</h3>
              {strategy.checklist.length > 0 ? (
                <div className="space-y-3">
                  {strategy.checklist.map(item => (
                    <div key={item.id} className="flex items-start gap-2 text-sm text-slate-700">
                      <div className="w-4 h-4 border-2 border-slate-300 rounded shrink-0 mt-0.5 bg-white"></div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No checklist defined.</p>
              )}
            </Card>

            <Card className="p-6 shadow-sm border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Risk Parameters</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Default Risk:</span>
                  <span className="font-medium text-slate-900">{strategy.riskRules.defaultRisk ? `$${strategy.riskRules.defaultRisk}` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Max Risk:</span>
                  <span className="font-medium text-slate-900">{strategy.riskRules.maxRisk ? `$${strategy.riskRules.maxRisk}` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Min R:R:</span>
                  <span className="font-medium text-slate-900">{strategy.riskRules.minRR ? `${strategy.riskRules.minRR}R` : 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Max Trades/Day:</span>
                  <span className="font-medium text-slate-900">{strategy.riskRules.maxTradesPerDay || 'Not set'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Environment</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Markets</span>
                  <div className="flex flex-wrap gap-1">
                    {strategy.markets.map(m => <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{m}</span>)}
                    {strategy.markets.length === 0 && <span className="text-sm text-slate-400 italic">Any</span>}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Sessions</span>
                  <div className="flex flex-wrap gap-1">
                    {strategy.sessions.map(s => <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{s}</span>)}
                    {strategy.sessions.length === 0 && <span className="text-sm text-slate-400 italic">Any</span>}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Timeframes</span>
                  <div className="flex flex-wrap gap-1">
                    {strategy.timeframes.map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{t}</span>)}
                    {strategy.timeframes.length === 0 && <span className="text-sm text-slate-400 italic">Any</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Trade History</h3>
            <p className="text-sm text-slate-500 mt-1">All {trades.length} trades recorded using {strategy.name}.</p>
          </div>
          {trades.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No trades recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Market</th>
                    <th className="px-6 py-3">Direction</th>
                    <th className="px-6 py-3 text-right">R:R</th>
                    <th className="px-6 py-3 text-right">Result</th>
                    <th className="px-6 py-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trades.slice().reverse().map(trade => (
                    <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">{format(new Date(trade.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{trade.market}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("px-2 py-1 rounded text-xs font-bold", trade.direction === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{trade.rrRatio ? `1:${trade.rrRatio}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        {trade.result === 'WIN' && <span className="text-green-600">WIN</span>}
                        {trade.result === 'LOSS' && <span className="text-red-600">LOSS</span>}
                        {trade.result === 'BREAK EVEN' && <span className="text-slate-600">BE</span>}
                        {trade.result === 'PENDING' && <span className="text-yellow-600">PENDING</span>}
                        {!trade.result && <span className="text-slate-400">-</span>}
                      </td>
                      <td className={cn("px-6 py-4 whitespace-nowrap text-right font-bold", trade.pnl && trade.pnl > 0 ? "text-green-600" : (trade.pnl && trade.pnl < 0 ? "text-red-600" : "text-slate-900"))}>
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

    </div>
  );
}
