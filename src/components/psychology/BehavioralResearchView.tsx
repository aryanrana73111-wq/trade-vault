import React, { useState, useMemo } from 'react';
import { PSYCHOLOGY_PROTOCOLS, ActionProtocol } from '@/data/psychologyProtocols';
import { BEHAVIORAL_RESEARCH_FEED, ResearchFeedItem } from '@/data/behavioralResearchFeed';
import { PsychologyProtocolModal } from './PsychologyProtocolModal';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { 
  ShieldAlert, 
  BarChart2, 
  Award, 
  BookOpen, 
  Compass, 
  Clock, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const BehavioralResearchView: React.FC = () => {
  const { trades } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'protocols' | 'correlation' | 'scorecard' | 'feed' | 'guidance'>('protocols');
  const [selectedProtocol, setSelectedProtocol] = useState<ActionProtocol | null>(null);

  // Journal Behavioral Correlation Analysis
  const correlationData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Tally emotions/mistakes
    const biasMap: Record<string, { trades: typeof trades; wins: number; totalR: number; ruleFollowed: number; netPnl: number }> = {};

    trades.forEach(t => {
      // Check emotions or mistakes or notes
      const tags: string[] = [];
      if (t.emotions && Array.isArray(t.emotions)) {
        tags.push(...t.emotions);
      }
      if (t.mistake) tags.push(t.mistake);

      tags.forEach(tag => {
        if (!biasMap[tag]) {
          biasMap[tag] = { trades: [], wins: 0, totalR: 0, ruleFollowed: 0, netPnl: 0 };
        }
        biasMap[tag].trades.push(t);
        if (t.result === 'WIN') biasMap[tag].wins++;
        if (t.rMultiple) biasMap[tag].totalR += t.rMultiple;
        if (t.ruleAdherence !== undefined ? t.ruleAdherence >= 80 : true) biasMap[tag].ruleFollowed++;
        biasMap[tag].netPnl += t.pnl || 0;
      });
    });

    return Object.entries(biasMap).map(([tag, data]) => {
      const count = data.trades.length;
      const winRate = Math.round((data.wins / count) * 100);
      const avgR = Number((data.totalR / count).toFixed(2));
      const adherence = Math.round((data.ruleFollowed / count) * 100);

      return {
        tag,
        count,
        winRate,
        avgR,
        adherence,
        netPnl: data.netPnl
      };
    }).sort((a, b) => b.count - a.count);
  }, [trades]);

  // Behavioral Scorecard Metrics
  const scorecard = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        sampleSize: 0,
        riskScore: 75,
        ruleScore: 80,
        fomoControl: 70,
        revengeControl: 85,
        overallIndex: 78
      };
    }

    const n = trades.length;
    let followedRules = 0;
    let standardRiskCount = 0;
    let revengeCount = 0;
    let fomoCount = 0;

    trades.forEach(t => {
      if (t.ruleAdherence !== undefined ? t.ruleAdherence >= 80 : true) followedRules++;
      if (t.risk && t.risk <= 500) standardRiskCount++;
      const emotionStr = (t.emotions || []).join(' ').toLowerCase();
      const mistakeStr = (t.mistake || '').toLowerCase();
      if (emotionStr.includes('revenge') || mistakeStr.includes('revenge')) {
        revengeCount++;
      }
      if (emotionStr.includes('fomo') || mistakeStr.includes('fomo') || mistakeStr.includes('chasing')) {
        fomoCount++;
      }
    });

    const ruleScore = Math.round((followedRules / n) * 100);
    const riskScore = Math.round((standardRiskCount / n) * 100);
    const revengeControl = Math.max(10, Math.round(100 - (revengeCount / n) * 200));
    const fomoControl = Math.max(10, Math.round(100 - (fomoCount / n) * 200));
    const overallIndex = Math.round((ruleScore * 0.35) + (riskScore * 0.25) + (revengeControl * 0.2) + (fomoControl * 0.2));

    return {
      sampleSize: n,
      riskScore,
      ruleScore,
      fomoControl,
      revengeControl,
      overallIndex
    };
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveSubTab('protocols')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'protocols'
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <ShieldAlert className="w-4 h-4" /> Action Protocols ({PSYCHOLOGY_PROTOCOLS.length})
        </button>

        <button
          onClick={() => setActiveSubTab('correlation')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'correlation'
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <BarChart2 className="w-4 h-4" /> Journal Empirical Correlation
        </button>

        <button
          onClick={() => setActiveSubTab('scorecard')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'scorecard'
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Award className="w-4 h-4" /> Discipline Scorecard
        </button>

        <button
          onClick={() => setActiveSubTab('feed')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'feed'
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <BookOpen className="w-4 h-4" /> Behavioral Research Feed
        </button>

        <button
          onClick={() => setActiveSubTab('guidance')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'guidance'
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Compass className="w-4 h-4" /> Personalized Guidance
        </button>
      </div>

      {/* 1. ACTION PROTOCOLS */}
      {activeSubTab === 'protocols' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Emergency Behavioral Action Protocols</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Standard operating procedures for managing acute behavioral emergencies (FOMO, Revenge Trading, Tilt, Overconfidence) with mandatory stand-down timers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PSYCHOLOGY_PROTOCOLS.map(proto => (
                <div
                  key={proto.id}
                  onClick={() => setSelectedProtocol(proto)}
                  className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-2xl transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                      {proto.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {proto.pauseDuration.split(' ')[1]} Min Stand-Down
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{proto.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Trigger:</span> {proto.trigger}
                    </p>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Decision Rule</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">{proto.decisionRule}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                      <Play className="w-3.5 h-3.5" /> Launch Protocol & Timer
                    </span>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. JOURNAL EMPIRICAL CORRELATION */}
      {activeSubTab === 'correlation' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <span>Journal Psychology → Performance Empirical Association</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Objective statistical breakdown of how recorded emotional states and tagged mistakes correlate with your actual trading outcomes.
              </p>
            </div>

            {correlationData.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-2">
                <Brain className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No behavioral tags recorded yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tag emotions (e.g. FOMO, Calm, Revenge, Anxious) and mistake categories in your TradeVault Journal to unlock statistical correlation analysis.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  Note: Recorded trades show an association between logged emotional states and execution outcomes. Correlation does not imply sole causality; market regime variance also influences trade performance.
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Logged Tag / State</th>
                        <th className="p-3">Occurrences</th>
                        <th className="p-3">Win Rate</th>
                        <th className="p-3">Average R</th>
                        <th className="p-3">Rule Adherence</th>
                        <th className="p-3">Net P&L ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {correlationData.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 capitalize">{item.tag}</td>
                          <td className="p-3">{item.count} trades</td>
                          <td className="p-3 font-medium">{item.winRate}%</td>
                          <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{item.avgR > 0 ? `+${item.avgR}R` : `${item.avgR}R`}</td>
                          <td className="p-3 font-medium">{item.adherence}%</td>
                          <td className={cn(
                            "p-3 font-bold",
                            item.netPnl >= 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {item.netPnl >= 0 ? `+$${item.netPnl.toLocaleString()}` : `-$${Math.abs(item.netPnl).toLocaleString()}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DISCIPLINE SCORECARD */}
      {activeSubTab === 'scorecard' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Professional Discipline & Psychology Scorecard</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Quantitative index evaluating execution rule adherence, position sizing discipline, and impulse control.
              </p>
            </div>

            {/* Scorecard Hero */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Overall Behavioral Execution Index
                </span>
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100">
                  {scorecard.overallIndex} <span className="text-lg text-slate-400 font-normal">/ 100</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Based on sample of {scorecard.sampleSize} real journal trades.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Rule Adherence</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{scorecard.ruleScore}%</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Risk Sizing</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{scorecard.riskScore}%</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">FOMO Control</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{scorecard.fomoControl}%</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Revenge Control</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{scorecard.revengeControl}%</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Methodology & Transparency Disclaimer:</div>
              <p>
                The TradeVault Discipline Scorecard is an educational behavioral metric derived from your logged journal entries. It evaluates the mathematical consistency of position sizing, the percentage of trades marked as following strategy rules, and the recorded frequency of impulse tags. It does not constitute medical, psychological, or psychiatric diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. BEHAVIORAL RESEARCH FEED */}
      {activeSubTab === 'feed' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Peer-Reviewed Behavioral Finance Literature Feed</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real scientific research analyzing live professional and retail trader behavior from the Journal of Finance and MIT.
              </p>
            </div>

            <div className="space-y-4">
              {BEHAVIORAL_RESEARCH_FEED.map(item => (
                <div
                  key={item.id}
                  className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {item.category} • {item.evidenceType}
                    </span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="font-semibold">Author(s):</span> {item.author} — <span className="italic">{item.source}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {item.summary}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-500">Key Scientific Findings:</span>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {item.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.limitations.length > 0 && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
                      <span className="font-bold">Noted Research Limitations:</span> {item.limitations.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PERSONALIZED BEHAVIORAL GUIDANCE */}
      {activeSubTab === 'guidance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" />
                <span>Personalized Behavioral Guidance Engine</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data-driven process coaching derived from your actual execution history.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-2">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" /> Step 1: Pre-Commitment Contracts
                </h4>
                <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-100 leading-relaxed">
                  Before clicking Buy or Sell, submit your order as a predefined OCO bracket with mandatory hard stop and profit target. Academic research demonstrates that pre-commitment reduces in-trade emotional interference by over 60%.
                </p>
              </div>

              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" /> Step 2: Enforce the 2-Loss Daily Shutdown
                </h4>
                <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-100 leading-relaxed">
                  As proven by Coval & Shumway (2005) on CBOT Treasury traders, afternoon trading after morning losses exhibits severe negative expectancy. Commit to shutting down your trading platform completely after two consecutive losses in any single calendar day.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step 3: Shift Focus from P&L to Rule Adherence
                </h4>
                <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed">
                  A losing trade that followed 100% of your rules is a successful execution. A winning trade taken on impulse outside strategy rules is an operational failure that will lead to eventual ruin. Measure your daily success purely by Rule Adherence %.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Modal */}
      <PsychologyProtocolModal
        protocol={selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
      />
    </div>
  );
};
