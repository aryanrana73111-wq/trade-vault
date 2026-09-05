import React, { useState } from 'react';
import { 
  GitCompare, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  HelpCircle, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Brain,
  Layers,
  AlertCircle
} from 'lucide-react';
import { Trade } from '@/types';
import { DiscoveredPattern, DataAccessPermissions, ShowMeWhyDetails } from '@/types/aiLabs';
import { getEvidenceLevel, getEvidenceLevelBadge, discoverPatterns } from '@/lib/aiLabs/engine';
import { Button } from '@/components/ui/Button';

interface PatternLabTabProps {
  trades: Trade[];
  permissions: DataAccessPermissions;
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
  onOpenShowMeWhy: (title: string, details: ShowMeWhyDetails, tradeIds: string[]) => void;
}

export const PatternLabTab: React.FC<PatternLabTabProps> = ({
  trades,
  permissions,
  onOpenEvidence,
  onOpenShowMeWhy
}) => {
  // Preset or custom comparator mode
  const [compareMode, setCompareMode] = useState<'presets' | 'custom'>('presets');
  const [activePreset, setActivePreset] = useState<'london_vs_ny' | 'calm_vs_fomo' | 'long_vs_short' | 'strat_a_b'>('london_vs_ny');

  // Custom filters for Side A and Side B
  const [filterA, setFilterA] = useState({
    market: 'All',
    strategy: 'All',
    session: 'London',
    direction: 'All',
    emotion: 'All'
  });

  const [filterB, setFilterB] = useState({
    market: 'All',
    strategy: 'All',
    session: 'New York',
    direction: 'All',
    emotion: 'All'
  });

  // Extract unique options from actual recorded data
  const markets = ['All', ...Array.from(new Set(trades.map(t => t.market).filter(Boolean)))];
  const strategies = ['All', ...Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)))];
  const sessions = ['All', 'London', 'New York', 'Asian', 'Sydney'];
  const directions = ['All', 'BUY', 'SELL'];
  const emotions = ['All', 'Calm', 'FOMO', 'Revenge', 'Fear', 'Greed', 'Confident'];

  // Apply Preset configurations
  const applyPreset = (preset: typeof activePreset) => {
    setActivePreset(preset);
    if (preset === 'london_vs_ny') {
      setFilterA({ market: 'All', strategy: 'All', session: 'London', direction: 'All', emotion: 'All' });
      setFilterB({ market: 'All', strategy: 'All', session: 'New York', direction: 'All', emotion: 'All' });
    } else if (preset === 'calm_vs_fomo') {
      setFilterA({ market: 'All', strategy: 'All', session: 'All', direction: 'All', emotion: 'Calm' });
      setFilterB({ market: 'All', strategy: 'All', session: 'All', direction: 'All', emotion: 'FOMO' });
    } else if (preset === 'long_vs_short') {
      setFilterA({ market: 'All', strategy: 'All', session: 'All', direction: 'BUY', emotion: 'All' });
      setFilterB({ market: 'All', strategy: 'All', session: 'All', direction: 'SELL', emotion: 'All' });
    } else if (preset === 'strat_a_b' && strategies.length >= 3) {
      setFilterA({ market: 'All', strategy: strategies[1], session: 'All', direction: 'All', emotion: 'All' });
      setFilterB({ market: 'All', strategy: strategies[2], session: 'All', direction: 'All', emotion: 'All' });
    }
  };

  // Helper to filter trades
  const filterList = (filter: typeof filterA) => {
    return trades.filter(t => {
      if (filter.market !== 'All' && t.market !== filter.market) return false;
      if (filter.strategy !== 'All' && t.strategy !== filter.strategy) return false;
      if (filter.session !== 'All' && t.session !== filter.session) return false;
      if (filter.direction !== 'All' && t.direction !== filter.direction) return false;
      if (filter.emotion !== 'All' && !t.emotions?.includes(filter.emotion)) return false;
      return true;
    });
  };

  // Helper to calculate statistics
  const calculateStats = (list: Trade[]) => {
    const closed = list.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
    const wins = closed.filter(t => t.result === 'WIN').length;
    const losses = closed.filter(t => t.result === 'LOSS').length;

    let grossProfit = 0;
    let grossLoss = 0;
    let netPnl = 0;
    let totalR = 0;
    let riskSum = 0;
    let adherenceSum = 0;
    let adherenceCount = 0;

    closed.forEach(t => {
      const p = t.pnl || 0;
      netPnl += p;
      if (p > 0) grossProfit += p;
      if (p < 0) grossLoss += Math.abs(p);

      const r = t.rMultiple !== undefined ? t.rMultiple : (t.risk ? p / t.risk : 0);
      totalR += r;

      if (t.riskPercent) riskSum += t.riskPercent;
      else if (t.risk) riskSum += (t.risk / 10000) * 100;

      if (t.ruleAdherence !== undefined) {
        adherenceSum += t.ruleAdherence;
        adherenceCount++;
      }
    });

    const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;
    const avgR = closed.length > 0 ? totalR / closed.length : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 100 : 0);
    const avgRisk = closed.length > 0 ? riskSum / closed.length : 0;
    const avgAdherence = adherenceCount > 0 ? adherenceSum / adherenceCount : 0;

    return {
      count: list.length,
      closedCount: closed.length,
      winRate,
      avgR,
      netR: totalR,
      profitFactor,
      avgRisk,
      avgAdherence,
      tradeIds: list.map(t => t.id)
    };
  };

  const tradesA = filterList(filterA);
  const tradesB = filterList(filterB);

  const statsA = calculateStats(tradesA);
  const statsB = calculateStats(tradesB);

  const discoveredPatterns: DiscoveredPattern[] = discoverPatterns(trades, permissions);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Pattern Lab & Discovery
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test multi-variable setups against actual recorded trades and detect candidate historical tendencies.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'london_vs_ny', label: 'London vs NY' },
            { id: 'calm_vs_fomo', label: 'Calm vs FOMO' },
            { id: 'long_vs_short', label: 'Long vs Short' },
            { id: 'strat_a_b', label: 'Strategy A vs B' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                activePreset === p.id && compareMode === 'presets'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* SIDE-BY-SIDE PATTERN COMPARATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SETUP A */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Setup Pattern A</h4>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              {statsA.count} trades ({statsA.closedCount} closed)
            </span>
          </div>

          {/* Filter Controls A */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Session</label>
              <select
                value={filterA.session}
                onChange={(e) => setFilterA({ ...filterA, session: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {sessions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emotion</label>
              <select
                value={filterA.emotion}
                onChange={(e) => setFilterA({ ...filterA, emotion: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {emotions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Direction</label>
              <select
                value={filterA.direction}
                onChange={(e) => setFilterA({ ...filterA, direction: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {directions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Market</label>
              <select
                value={filterA.market}
                onChange={(e) => setFilterA({ ...filterA, market: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {markets.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Strategy</label>
              <select
                value={filterA.strategy}
                onChange={(e) => setFilterA({ ...filterA, strategy: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {strategies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Metric KPI cards A */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Win Rate</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {statsA.closedCount > 0 ? `${statsA.winRate.toFixed(1)}%` : '—'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Average R</span>
              <span className={`text-base font-bold ${statsA.avgR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {statsA.closedCount > 0 ? `${statsA.avgR > 0 ? '+' : ''}${statsA.avgR.toFixed(2)}R` : '—'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Profit Factor</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {statsA.closedCount > 0 ? statsA.profitFactor.toFixed(2) : '—'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">
              Rule Adherence: <strong className="text-slate-700 dark:text-slate-300">{statsA.avgAdherence.toFixed(0)}%</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={statsA.count === 0}
              onClick={() => onOpenEvidence("Setup Pattern A Evidence", `${statsA.count} matching trades`, statsA.tradeIds)}
              className="text-xs flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> View Trades ({statsA.count})
            </Button>
          </div>
        </div>

        {/* SETUP B */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                B
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Setup Pattern B</h4>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              {statsB.count} trades ({statsB.closedCount} closed)
            </span>
          </div>

          {/* Filter Controls B */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Session</label>
              <select
                value={filterB.session}
                onChange={(e) => setFilterB({ ...filterB, session: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {sessions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emotion</label>
              <select
                value={filterB.emotion}
                onChange={(e) => setFilterB({ ...filterB, emotion: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {emotions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Direction</label>
              <select
                value={filterB.direction}
                onChange={(e) => setFilterB({ ...filterB, direction: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {directions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Market</label>
              <select
                value={filterB.market}
                onChange={(e) => setFilterB({ ...filterB, market: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {markets.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Strategy</label>
              <select
                value={filterB.strategy}
                onChange={(e) => setFilterB({ ...filterB, strategy: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {strategies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Metric KPI cards B */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Win Rate</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {statsB.closedCount > 0 ? `${statsB.winRate.toFixed(1)}%` : '—'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Average R</span>
              <span className={`text-base font-bold ${statsB.avgR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {statsB.closedCount > 0 ? `${statsB.avgR > 0 ? '+' : ''}${statsB.avgR.toFixed(2)}R` : '—'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Profit Factor</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {statsB.closedCount > 0 ? statsB.profitFactor.toFixed(2) : '—'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">
              Rule Adherence: <strong className="text-slate-700 dark:text-slate-300">{statsB.avgAdherence.toFixed(0)}%</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={statsB.count === 0}
              onClick={() => onOpenEvidence("Setup Pattern B Evidence", `${statsB.count} matching trades`, statsB.tradeIds)}
              className="text-xs flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> View Trades ({statsB.count})
            </Button>
          </div>
        </div>
      </div>

      {/* AUTOMATIC PATTERN DISCOVERY SECTION */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Automatic Pattern Discovery
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Surfacing historical divergence across your recorded data without assuming causation or predicting future results.
          </p>
        </div>

        {discoveredPatterns.length === 0 ? (
          <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-1">
            <Layers className="w-7 h-7 text-slate-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No candidate patterns meeting sample threshold</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Automatic pattern discovery requires at least 6 to 15 trades with contrasting sessions, strategies, or directions to identify meaningful historical variation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveredPatterns.map(pat => {
              const badge = getEvidenceLevelBadge(pat.evidenceLevel);
              return (
                <div
                  key={pat.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{pat.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.badgeClass} flex-shrink-0 flex items-center gap-1`}>
                        <span className={`w-1 h-1 rounded-full ${badge.dotClass}`} />
                        {badge.label.split(' ')[0]} {badge.label.split(' ')[1]}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pat.description}
                    </p>

                    {/* Comparison Box */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">{pat.setupA.label}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {pat.setupA.avgR > 0 ? '+' : ''}{pat.setupA.avgR.toFixed(2)}R
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({pat.setupA.count} trades, {pat.setupA.winRate.toFixed(0)}% WR)
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">{pat.setupB.label}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {pat.setupB.avgR > 0 ? '+' : ''}{pat.setupB.avgR.toFixed(2)}R
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({pat.setupB.count} trades, {pat.setupB.winRate.toFixed(0)}% WR)
                        </span>
                      </div>
                    </div>

                    {pat.alternativeExplanation && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        <strong className="font-semibold text-slate-600 dark:text-slate-300 not-italic">Alternative Explanation: </strong>
                        {pat.alternativeExplanation}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenShowMeWhy(pat.title, pat.showMeWhy, [...pat.supportingTradeIds, ...pat.contradictingTradeIds])}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Show Me Why
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenEvidence(pat.title, pat.description, [...pat.supportingTradeIds, ...pat.contradictingTradeIds])}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Evidence ({pat.sampleSize})
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
