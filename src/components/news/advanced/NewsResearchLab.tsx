import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { 
  FlaskConical, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  ExternalLink,
  Plus,
  Bookmark,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';

export function NewsResearchLab() {
  const navigate = useNavigate();
  const { trades, saveLearning, saveRule } = useData();
  const [learningSavedNotice, setLearningSavedNotice] = useState<string | null>(null);
  const [activeBriefTab, setActiveBriefTab] = useState<'morning' | 'evening'>('morning');

  // Compute actual trade stats around news events
  const newsTradeMetrics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        newsTradesCount: 0,
        newsWinRate: 0,
        normalWinRate: 0,
        newsNetPnl: 0,
        newsTradesList: []
      };
    }

    // Identify trades taken on days with high impact events
    const highImpactEventDates = new Set(
      NEWS_EVENTS.filter(e => e.impact === 'HIGH').map(e => new Date(e.dateTime).toDateString())
    );

    const newsTrades = trades.filter(t => {
      const tradeDate = new Date(t.date).toDateString();
      return highImpactEventDates.has(tradeDate);
    });

    const normalTrades = trades.filter(t => {
      const tradeDate = new Date(t.date).toDateString();
      return !highImpactEventDates.has(tradeDate);
    });

    const newsWins = newsTrades.filter(t => (t.pnl || 0) > 0).length;
    const normalWins = normalTrades.filter(t => (t.pnl || 0) > 0).length;

    const newsWinRate = newsTrades.length > 0 ? (newsWins / newsTrades.length) * 100 : 0;
    const normalWinRate = normalTrades.length > 0 ? (normalWins / normalTrades.length) * 100 : 0;
    const newsNetPnl = newsTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    return {
      totalTrades: trades.length,
      newsTradesCount: newsTrades.length,
      newsWinRate: Math.round(newsWinRate),
      normalWinRate: Math.round(normalWinRate),
      newsNetPnl,
      newsTradesList: newsTrades.slice(0, 5)
    };
  }, [trades]);

  // Handle Save as Learning
  const handleSaveLearning = async (title: string, takeaway: string) => {
    try {
      const now = new Date();
      await saveLearning({
        content: `${title}: ${takeaway}`,
        date: now.getTime(),
        dateString: now.toISOString().split('T')[0],
        category: 'Fundamental',
        tags: ['News', 'Macro', 'Event Risk']
      });
      setLearningSavedNotice(`Saved learning: "${title}"`);
      setTimeout(() => setLearningSavedNotice(null), 4000);
    } catch (err) {
      console.error('Failed to save learning', err);
    }
  };

  // Handle Convert to Rule
  const handleSaveRule = async (ruleText: string) => {
    try {
      await saveRule({
        text: ruleText,
        category: 'Risk Management',
        priority: 'Important',
        status: 'Active',
        isPinned: false,
        order: 0
      });
      setLearningSavedNotice(`Added trading rule: "${ruleText}"`);
      setTimeout(() => setLearningSavedNotice(null), 4000);
    } catch (err) {
      console.error('Failed to save rule', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Notification Toast */}
      {learningSavedNotice && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {learningSavedNotice}
          </span>
          <button 
            type="button" 
            onClick={() => setLearningSavedNotice(null)}
            className="text-white/80 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. TRADE PERFORMANCE LAB: REAL USER TRADES vs NEWS EVENTS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                TRADEVAULT LABS INTEGRATION
              </span>
              <span className="text-xs text-slate-400 font-medium">Empirical Journal Synthesis</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              Your Trade Performance Around Major News Events
            </h3>
          </div>

          <button
            type="button"
            onClick={() => navigate('/analytics?tab=trades')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Analyze in Journal Analytics</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              News-Window Trades
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {newsTradeMetrics.newsTradesCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Of {newsTradeMetrics.totalTrades} total logged trades
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              News Day Win Rate
            </span>
            <span className={`text-lg sm:text-xl font-extrabold ${newsTradeMetrics.newsWinRate >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {newsTradeMetrics.newsTradesCount > 0 ? `${newsTradeMetrics.newsWinRate}%` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Vs {newsTradeMetrics.normalWinRate}% normal days
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              News Window Net PnL
            </span>
            <span className={`text-lg sm:text-xl font-extrabold ${newsTradeMetrics.newsNetPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(newsTradeMetrics.newsNetPnl)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Cumulative during volatility
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1">
              Event Risk Assessment
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block mt-1">
              {newsTradeMetrics.newsTradesCount === 0 ? 'No news trades logged' : (
                newsTradeMetrics.newsWinRate >= newsTradeMetrics.normalWinRate 
                  ? 'Positive event edge observed' 
                  : 'Higher drawdown during news releases'
              )}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Always monitor pre-release spreads
            </span>
          </div>
        </div>

        {/* Recent Trades Executed on News Days */}
        {newsTradeMetrics.newsTradesList.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Recent Journal Trades Around High-Impact Releases
            </h4>
            <div className="space-y-2">
              {newsTradeMetrics.newsTradesList.map(t => (
                <div 
                  key={t.id}
                  className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">{t.market}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${t.direction === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {t.direction}
                    </span>
                    <span className="text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-extrabold ${((t.pnl || 0) >= 0) ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(t.pnl || 0)}
                    </span>
                    <span className="text-slate-400">({t.result || 'CLOSED'})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. LEARNING & RULES CONVERTER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              DISCIPLINE & RULES
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Convert Macro Insights to Journal Learnings & Rules
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Recommended Event Learning
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              &ldquo;Avoid trading market orders within 3 minutes of FOMC or US CPI releases due to bid-ask spread widening and slippage.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSaveLearning(
                  'News Release Spread Widening',
                  'Avoid market orders within 3 minutes of FOMC/CPI due to spread expansion.'
                )}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save as Learning</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Recommended Risk Rule
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              &ldquo;Reduce maximum position risk by 50% on days with scheduled Red Folder (High Impact) central bank announcements.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSaveRule(
                  'Reduce position risk to 50% normal size on high-impact central bank release days.'
                )}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Convert to Active Rule</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MORNING MARKET BRIEF & DAILY RECAP */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              EDITORIAL CURATION
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Macro Intelligence Briefings
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveBriefTab('morning')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeBriefTab === 'morning'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Morning Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBriefTab('evening')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeBriefTab === 'evening'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Daily Recap</span>
            </button>
          </div>
        </div>

        {activeBriefTab === 'morning' ? (
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                Pre-Market Global Briefing
              </span>
              <span className="text-slate-400 text-[11px]">Published 06:30 EST</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Global equities opened mixed as investors digested persistent US consumer price inflation data. European indices are pricing in cautious easing following the ECB 25bps rate cut, while Gold consolidates near $2,490/oz with central bank accumulation underpinning spot prices.
            </p>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Top 3 Catalysts to Watch Today:
              </span>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <li>• 1. US Initial Jobless Claims (Consensus: 230K)</li>
                <li>• 2. Eurozone Industrial Output Figures</li>
                <li>• 3. Crude Oil EIA Inventory Print (Expected: -1.2M barrels)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-blue-500" />
                Post-Market Closing Recap
              </span>
              <span className="text-slate-400 text-[11px]">Published 17:15 EST</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              The US Dollar Index retained intraday gains (+0.28%) as Treasury yields held higher across the 2-year and 10-year tenors. Tech benchmarks absorbed modest valuation pressure while energy commodities climbed on maritime security alerts in the Red Sea.
            </p>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Overnight Risk Factors:
              </span>
              <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <li>• Asian session liquidity during Bank of Japan policy remarks</li>
                <li>• Geopolitical shipping updates from Strait of Bab el-Mandeb</li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
