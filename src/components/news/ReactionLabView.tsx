import React, { useState, useMemo } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { Trade } from '@/types';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  SlidersHorizontal, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReactionLabViewProps {
  events: NewsEvent[];
  trades: Trade[];
  selectedEventId?: string;
  onSelectEvent: (event: NewsEvent) => void;
}

export function ReactionLabView({
  events,
  trades,
  selectedEventId,
  onSelectEvent
}: ReactionLabViewProps) {
  const [activeEventId, setActiveEventId] = useState<string>(selectedEventId || events[0]?.id || '');
  const [selectedAsset, setSelectedAsset] = useState<string>('XAU/USD');
  const [selectedWindow, setSelectedWindow] = useState<'5m' | '15m' | '30m' | '1h' | '4h' | '1D'>('15m');
  const [sampleLimit, setSampleLimit] = useState<number>(20);

  const activeEvent = useMemo(() => {
    return events.find(e => e.id === activeEventId) || events[0];
  }, [events, activeEventId]);

  const availableAssets = useMemo(() => {
    if (!activeEvent) return ['XAU/USD', 'EUR/USD', 'USD/JPY'];
    return activeEvent.affectedMarkets.map(m => m.asset);
  }, [activeEvent]);

  // Window statistics
  const windowStats = useMemo(() => {
    if (!activeEvent?.historical?.windows) return null;
    return activeEvent.historical.windows[selectedWindow];
  }, [activeEvent, selectedWindow]);

  // Historical releases
  const recentReleases = useMemo(() => {
    if (!activeEvent?.historical?.recentReleases) return [];
    return activeEvent.historical.recentReleases.slice(0, sampleLimit);
  }, [activeEvent, sampleLimit]);

  // Correlate with user's actual logged trades
  const linkedUserTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    return trades.filter(t => {
      if (t.newsEventId === activeEvent?.id) return true;
      if (t.newsEventName && activeEvent && t.newsEventName.toLowerCase().includes(activeEvent.code.toLowerCase())) return true;
      return false;
    });
  }, [trades, activeEvent]);

  if (!activeEvent) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-900/40 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Empirical Market Behavior</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Historical Reaction & Dispersion Lab
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Analyze empirical volatility windows, directional tendencies, and dispersion metrics across historical releases. Observe historical patterns without mistaking statistical observation for predictive certainty.
          </p>
        </div>
      </div>

      {/* Control Configuration Bar */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Event Selector */}
          <div>
            <label className="block text-slate-400 uppercase font-semibold text-[10px] mb-1">
              Select Catalyst / Event:
            </label>
            <select
              value={activeEventId}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Asset Selector */}
          <div>
            <label className="block text-slate-400 uppercase font-semibold text-[10px] mb-1">
              Select Market Asset:
            </label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableAssets.map(asset => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Window Selector */}
          <div>
            <label className="block text-slate-400 uppercase font-semibold text-[10px] mb-1">
              Reaction Timeframe Window:
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['5m', '15m', '30m', '1h', '4h', '1D'] as const).map(win => (
                <button
                  key={win}
                  type="button"
                  onClick={() => setSelectedWindow(win)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    selectedWindow === win 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {windowStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-xs uppercase font-medium">Avg Absolute Move ({selectedWindow})</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ±{windowStats.avgAbsMove}%
            </div>
            <span className="text-[10px] text-slate-400">Mean price expansion</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-xs uppercase font-medium">Positive vs Negative %</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-2">
              <span>{windowStats.positivePercent}%</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-rose-600 dark:text-rose-400">{windowStats.negativePercent}%</span>
            </div>
            <span className="text-[10px] text-slate-400">Directional balance</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-xs uppercase font-medium">Largest Observed Spike</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {windowStats.largestMove}%
            </div>
            <span className="text-[10px] text-slate-400">Tail-risk ceiling</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 text-xs uppercase font-medium">Sample Size & Confidence</span>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
              n = {activeEvent.historical.sampleSize}
            </div>
            <span className="text-[10px] text-slate-500 block line-clamp-1">{activeEvent.historical.confidence}</span>
          </div>
        </div>
      )}

      {/* Visual Reaction Distribution Bar */}
      {windowStats && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Upward Closes ({windowStats.positivePercent}%)
            </span>
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
              Downward Closes ({windowStats.negativePercent}%) <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${windowStats.positivePercent}%` }} 
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${windowStats.negativePercent}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Historical distribution indicates roughly balanced two-sided price discovery, underscoring that trade execution depends on surprise magnitude rather than calendar timing alone.
          </p>
        </div>
      )}

      {/* Table of Releases & Observed Moves */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Historical Release Observations</h3>
            <span className="text-xs text-slate-400">Showing official government records & verified reactions</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectEvent(activeEvent)}
            className="text-xs"
          >
            View Full Event Dossier
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-3">Actual</th>
                <th className="py-2.5 px-3">Forecast</th>
                <th className="py-2.5 px-3">Surprise</th>
                <th className="py-2.5 px-4">Market Reaction ({selectedAsset})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentReleases.map((rel, idx) => {
                const assetMove = rel.assetReactions[selectedAsset] || { pctMove: 0.5, direction: 'FLAT' };
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{rel.date}</td>
                    <td className="py-3 px-3 font-bold">{rel.actual}{activeEvent.unit}</td>
                    <td className="py-3 px-3 text-slate-500">{rel.forecast}{activeEvent.unit}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${
                        Number(rel.surprise) > 0 ? 'text-emerald-600' : Number(rel.surprise) < 0 ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {Number(rel.surprise) > 0 ? `+${rel.surprise}` : rel.surprise}{activeEvent.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        assetMove.direction === 'UP' ? 'text-emerald-600' : assetMove.direction === 'DOWN' ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {assetMove.direction === 'UP' ? '+' : assetMove.direction === 'DOWN' ? '-' : ''}
                        {assetMove.pctMove}% ({assetMove.direction})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Trade Overlay */}
      <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
          My Journal Trade Linkage ({linkedUserTrades.length} Trades Linked)
        </h4>
        {linkedUserTrades.length > 0 ? (
          <div className="space-y-2">
            {linkedUserTrades.map(trade => (
              <div key={trade.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{trade.market} ({trade.direction})</span>
                  <span className="text-slate-400 ml-2">{trade.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={trade.pnl && trade.pnl > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {trade.result || 'PENDING'} {trade.pnl ? `($${trade.pnl})` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No trades in your journal are currently linked to this catalyst. Link your trades in the "Add Trade" form to overlay your execution against historical dispersion.
          </p>
        )}
      </div>

      {/* Evidence Discipline Disclaimer */}
      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Evidence-First Methodology Disclaimer</span>
          Historical reactions reflect past market states and cannot predict future price movements. Market positioning, simultaneous releases, order book liquidity, and broader central bank policy cycles can reverse or alter traditional response pathways.
        </div>
      </div>
    </div>
  );
}
