import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '@/lib/settings';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { formatCurrency, formatNumber, dedupById } from '@/lib/utils';
import { calculateKPIs } from '@/lib/calculations';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Target, TrendingUp, DollarSign, Crosshair, TrendingDown, Scale, BookOpenCheck, Shield, Pin, Plus, Calendar, ArrowRight, Compass } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { TradingCalendarWidget } from '@/components/dashboard/TradingCalendarWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { trades: rawTrades, learnings, rules } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setTrades([...rawTrades].sort((a, b) => a.date - b.date));
    
    const handleSettingsUpdate = () => setSettings(getSettings());
    window.addEventListener('tradevault_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('tradevault_settings_updated', handleSettingsUpdate);
  }, [rawTrades]);

  const kpis = calculateKPIs(trades);
  const w = settings.dashboard.widgets || [];
  const showWidget = (name: string) => {
    if (name === 'Trading Calendar') {
      if (w.includes('Trading Calendar')) return true;
      // If user has old defaults saved before Trading Calendar was introduced
      const isLegacyConfig = w.length >= 7 && w.includes('Equity Curve') && w.includes('Total P&L');
      if (isLegacyConfig) return true;
    }
    return w.includes(name);
  };

  // Equity Curve Data (chronological order)
  let runningEquity = 0;
  const sortedClosedTrades = [...trades]
    .filter(t => t.result && t.result !== 'PENDING')
    .sort((a, b) => a.date - b.date);

  const equityData = sortedClosedTrades.map(t => {
    runningEquity += (t.pnl || 0);
    return {
      name: format(new Date(t.date), 'MMM dd'),
      equity: runningEquity,
      trade: t
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <button
            onClick={() => navigate('/settings?tab=profile')}
            className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Edit Profile Settings"
          >
            <UserAvatar 
              avatarUrl={profile?.avatarUrl} 
              size="lg" 
              className="border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
            />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {profile?.fullName || user?.displayName || 'Dashboard'}
              </h1>
              {profile?.tradingStyle && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase tracking-wider">
                  {profile.tradingStyle}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back. Here is your active trading performance overview.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/command-center')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Trading Command Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {showWidget('Total P&L') && (
          <StatCard 
            title="Net P&L" 
            value={formatCurrency(kpis.netPnl)}
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
            trend={kpis.netPnl >= 0 ? 'up' : 'down'}
          />
        )}
        {showWidget('Win Rate') && (
          <StatCard 
            title="Win Rate" 
            value={`${formatNumber(kpis.winRate, 1)}%`}
            icon={<Target className="w-5 h-5 text-blue-600" />}
            trend={kpis.winRate >= 50 ? 'up' : 'down'}
          />
        )}
        {showWidget('Total Trades') && (
          <StatCard 
            title="Total Trades" 
            value={kpis.totalTrades.toString()}
            icon={<Activity className="w-5 h-5 text-blue-600" />}
            trend="neutral"
          />
        )}
        {showWidget('Profit Factor') && (
          <StatCard 
            title="Profit Factor" 
            value={kpis.closedTradesCount === 0 ? '--' : (kpis.isAllWins ? 'Max (All Wins)' : (kpis.profitFactor > 0 ? formatNumber(kpis.profitFactor, 2) : '0.00'))}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            trend={kpis.closedTradesCount === 0 ? 'neutral' : (kpis.profitFactor >= 1 ? 'up' : 'down')}
          />
        )}
      </div>

      {/* KPI Stats Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {showWidget('Expectancy') && (
          <StatCard 
            title="Expectancy" 
            value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.expectancy) : '--'}
            icon={<Crosshair className="w-5 h-5 text-blue-600" />}
            trend={kpis.expectancy >= 0 && kpis.closedTradesCount > 0 ? 'up' : (kpis.closedTradesCount > 0 ? 'down' : 'neutral')}
          />
        )}
        {showWidget('Average R') && (
          <StatCard 
            title="Average R" 
            value={kpis.closedTradesCount > 0 ? `${formatNumber(kpis.averageR, 2)}R` : '--'}
            icon={<Target className="w-5 h-5 text-blue-600" />}
            trend={kpis.averageR > 0 ? 'up' : (kpis.averageR < 0 ? 'down' : 'neutral')}
          />
        )}
        {showWidget('Maximum Drawdown') && (
          <StatCard 
            title="Max Drawdown" 
            value={kpis.maxDrawdown > 0 ? `-${formatCurrency(kpis.maxDrawdown)}` : '--'}
            icon={<TrendingDown className="w-5 h-5 text-red-600" />}
            trend="down"
          />
        )}
        {showWidget('Risk Overview') && (
          <StatCard 
            title="Average Risk" 
            value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.averageRisk) : '--'}
            icon={<Scale className="w-5 h-5 text-blue-600" />}
            trend="neutral"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve Chart */}
        {showWidget('Equity Curve') && (
          <Card className="lg:col-span-2 p-6 shadow-sm border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Equity Curve</h2>
            </div>
          <div className="h-[300px] w-full">
            {equityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => `$${val}`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Equity']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No closed trades yet to display equity curve.
              </div>
            )}
          </div>
        </Card>
        )}

        {/* Recent Trades */}
        {showWidget('Recent Trades') && (
        <Card className="p-6 shadow-sm border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Trades</h2>
          </div>
          <div className="space-y-4">
            {dedupById(trades).slice(-5).reverse().map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trade.direction === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {trade.direction}
                    </span>
                    <span className="font-medium text-slate-900 text-sm">{trade.market}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{format(new Date(trade.date), 'MMM dd')} {trade.time}</div>
                </div>
                <div className={`font-semibold text-sm ${trade.pnl && trade.pnl >= 0 ? 'text-green-600' : (trade.pnl ? 'text-red-600' : 'text-slate-500')}`}>
                  {trade.result === 'PENDING' ? 'Pending' : (trade.pnl && trade.pnl > 0 ? '+' : '') + formatCurrency(trade.pnl || 0)}
                </div>
              </div>
            ))}
            {trades.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">No recent trades found.</div>
            )}
          </div>
        </Card>
        )}
      </div>

      {/* Trading Calendar View */}
      {showWidget('Trading Calendar') && (
        <TradingCalendarWidget trades={trades} />
      )}

      {/* Secondary Insights & Rules Grid */}
      {(showWidget('Today Learning') || showWidget('My Rules')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today Learning Widget */}
          {showWidget('Today Learning') && (
            <Card className="p-6 shadow-sm border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Today's Learning</h2>
                </div>
                <button
                  onClick={() => navigate('/learning-rules?tab=learning')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {(() => {
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const todayLearnings = learnings.filter(l => l.dateString === todayStr);
                const latestLearning = learnings[0];

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                      <span className="text-xs font-medium text-slate-600">Today's Insights Logged</span>
                      <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                        {todayLearnings.length}
                      </span>
                    </div>

                    {latestLearning ? (
                      <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                          <span className="font-semibold text-slate-700">{latestLearning.category}</span>
                          <span>{latestLearning.dateString || format(new Date(latestLearning.date || latestLearning.createdAt), 'MMM dd')}</span>
                        </div>
                        <p className="text-slate-800 line-clamp-2 leading-relaxed">
                          {latestLearning.content}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">
                        No learning entry recorded yet today.
                      </p>
                    )}

                    <button
                      onClick={() => navigate('/learning-rules?tab=learning')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Record Daily Learning
                    </button>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* My Rules Widget */}
          {showWidget('My Rules') && (
            <Card className="p-6 shadow-sm border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Discipline Rules</h2>
                </div>
                <button
                  onClick={() => navigate('/learning-rules?tab=rules')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Rules <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {(() => {
                const uniqueRules = dedupById(rules);
                const activeRules = uniqueRules.filter(r => r.status === 'Active');
                const pinnedRules = uniqueRules.filter(r => r.isPinned);
                const displayRules = pinnedRules.length > 0 ? pinnedRules : activeRules;

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Active</span>
                        <span className="text-base font-bold text-slate-900">{activeRules.length}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                        <span className="text-amber-700 block text-[11px] font-medium">Pinned</span>
                        <span className="text-base font-bold text-amber-900">{pinnedRules.length}</span>
                      </div>
                    </div>

                    {displayRules.length > 0 ? (
                      <div className="space-y-1.5">
                        {displayRules.slice(0, 3).map(r => (
                          <div key={r.id} className="p-2 rounded border border-slate-100 bg-slate-50 flex items-start gap-2 text-xs">
                            {r.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mt-0.5 flex-shrink-0" />}
                            <p className="text-slate-800 line-clamp-1 flex-1 font-medium">{r.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">
                        No trading rules created yet.
                      </p>
                    )}

                    <button
                      onClick={() => navigate('/learning-rules?tab=rules')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Manage Trading Rules
                    </button>
                  </div>
                );
              })()}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="p-6 shadow-sm border-slate-200 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend !== 'neutral' && (
          <span className={`flex items-center text-sm font-medium mb-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
          </span>
        )}
      </div>
    </Card>
  );
}
