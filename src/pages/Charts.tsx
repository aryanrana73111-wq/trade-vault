import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  BookOpen,
  PlusCircle,
  Activity,
  Layers,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { TradingViewAdvancedChart } from '@/components/charts/TradingViewAdvancedChart';
import {
  TradingViewMarketSummary,
  TradingViewMarketOverview,
  TradingViewMarketData,
  TradingViewWorldMarketSummary,
} from '@/components/charts/TradingViewWidgets';

/**
 * ChartsPage - Clean Multi-Asset Market Viewing Workspace
 *
 * Dedicated to institutional technical analysis, market surveillance,
 * and cross-asset analytics using official TradingView Web Components.
 *
 * Layout Hierarchy:
 * 1. Charts Workspace Header
 * 2. Horizontal Market Summary
 * 3. Primary Advanced Chart (NASDAQ:NDX, 15m, full height)
 * 4. Market Overview (Indices, Tech Stocks, Crypto)
 * 5. Cross-Asset Market Data Table (Indices, Futures, Bonds, Forex)
 * 6. World Market Summary (Interactive Global Map & Asset Views)
 */
export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-16">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* =================================================================== */}
        {/* 1. CHARTS WORKSPACE HEADER                                          */}
        {/* =================================================================== */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Trading Workspace
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live TradingView Ecosystem
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time technical analysis, cross-asset analytics, and global market surveillance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <Link
              to="/journal"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-2 transition shadow-sm"
              title="Open Trade Journal"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Trade Journal</span>
            </Link>

            <Link
              to="/add-trade"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/25 active:scale-95"
              title="Log Trade Execution"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Trade</span>
            </Link>
          </div>
        </header>

        {/* =================================================================== */}
        {/* 2. MARKET SUMMARY (Horizontal Ticker Bar)                           */}
        {/* =================================================================== */}
        <section aria-label="Market Summary" className="w-full">
          <TradingViewMarketSummary direction="horizontal" theme="dark" />
        </section>

        {/* =================================================================== */}
        {/* 3. PRIMARY ADVANCED CHART WORKSPACE                                 */}
        {/* =================================================================== */}
        <section
          aria-label="Technical Chart Workstation"
          className="w-full rounded-2xl bg-[#0b0f19] border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="px-5 py-3 border-b border-white/[0.06] bg-slate-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                TradingView Advanced Chart
              </h2>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                • Interactive Multi-Asset Technical Analysis Workstation
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[11px] font-semibold">
                Default: NASDAQ:NDX • 15m
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                Symbol Search Enabled
              </span>
            </div>
          </div>

          {/* Full-width Main Chart Canvas */}
          <div className="w-full h-[640px] md:h-[720px] lg:h-[780px] relative bg-[#0b0f19]">
            <TradingViewAdvancedChart
              symbol="NASDAQ:NDX"
              interval="15"
              allowSymbolChange={true}
              theme="dark"
              className="w-full h-full"
            />
          </div>
        </section>

        {/* =================================================================== */}
        {/* 4. MARKET OVERVIEW (Indices, Stocks, Crypto)                        */}
        {/* =================================================================== */}
        <section aria-label="Market Overview" className="w-full">
          <TradingViewMarketOverview theme="dark" />
        </section>

        {/* =================================================================== */}
        {/* 5. CROSS-ASSET MARKET DATA TABLE                                    */}
        {/* =================================================================== */}
        <section aria-label="Cross-Asset Market Data" className="w-full">
          <TradingViewMarketData theme="dark" />
        </section>

        {/* =================================================================== */}
        {/* 6. WORLD MARKET SUMMARY (Interactive Map)                           */}
        {/* =================================================================== */}
        <section aria-label="World Market Summary" className="w-full">
          <TradingViewWorldMarketSummary theme="dark" />
        </section>
      </div>
    </div>
  );
}
