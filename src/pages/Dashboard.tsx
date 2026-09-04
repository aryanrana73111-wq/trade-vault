import React, { useEffect, useState } from 'react';
import { getSettings } from '@/lib/settings';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { calculateKPIs } from '@/lib/calculations';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Target, TrendingUp, DollarSign, Crosshair, TrendingDown, Scale } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export default function Dashboard() {
  const { trades: rawTrades } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    setTrades([...rawTrades].sort((a, b) => a.date - b.date));
    
    const handleSettingsUpdate = () => setSettings(getSettings());
    window.addEventListener('tradevault_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('tradevault_settings_updated', handleSettingsUpdate);
  }, [rawTrades]);

  const kpis = calculateKPIs(trades);
  const w = settings.dashboard.widgets;
  const showWidget = (name: string) => w.includes(name);

  // Equity Curve Data
  let runningEquity = 0;
  const equityData = trades.filter(t => t.result && t.result !== 'PENDING').map(t => {
    runningEquity += (t.pnl || 0);
    return {
      name: format(new Date(t.date), 'MMM dd'),
      equity: runningEquity,
      trade: t
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is your trading performance.</p>
        </div>
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
            value={kpis.profitFactor === Infinity ? '∞' : (kpis.profitFactor ? formatNumber(kpis.profitFactor, 2) : '--')}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            trend={kpis.profitFactor >= 1 ? 'up' : (kpis.profitFactor > 0 ? 'down' : 'neutral')}
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
            {trades.slice(-5).reverse().map(trade => (
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
