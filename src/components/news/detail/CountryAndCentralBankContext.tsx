import React from 'react';
import { CountryMacroProfile, CentralBankContext } from '@/types/eventIntelligence';
import { Landmark, Globe2, TrendingUp, Calendar, Compass, ExternalLink } from 'lucide-react';

interface CountryAndCentralBankContextProps {
  country: CountryMacroProfile;
  centralBank: CentralBankContext;
  currency: string;
  nextReleaseDate?: string;
  onOpenCountryProfile?: (currency: string) => void;
}

export function CountryAndCentralBankContext({
  country,
  centralBank,
  currency,
  nextReleaseDate = 'October 14, 2026',
  onOpenCountryProfile
}: CountryAndCentralBankContextProps) {
  const relevantMarkets = [
    { symbol: `${currency} Crosses`, note: 'Primary Foreign Exchange Sensitivity' },
    { symbol: 'XAU/USD', note: 'Global Sovereign Benchmark / Real Rates' },
    { symbol: 'DXY Index', note: 'Trade-Weighted Dollar Basket' },
    { symbol: `${currency} 10Y Benchmark`, note: 'Sovereign Debt Discounting Curve' },
    { symbol: 'BTC/USD', note: 'High-Beta Liquidity Sensitivity' }
  ];

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. COUNTRY MACRO CONTEXT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{country.flag}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {country.country} Macro Context
                </h3>
                <span className="text-[11px] text-slate-400">
                  National statistical regime overview
                </span>
              </div>
            </div>
            {onOpenCountryProfile && (
              <button
                type="button"
                onClick={() => onOpenCountryProfile(currency)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Full Profile →
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">GDP Growth</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {country.gdpGrowth}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Inflation</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {country.inflation}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Policy Rate</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {country.interestRate}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Unemployment</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {country.unemployment}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">10Y Benchmark</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {country.tenYearYield}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Debt / GDP</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {country.debtToGdp}
              </span>
            </div>
          </div>
        </div>

        {/* 2. CENTRAL BANK CONTEXT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {centralBank.institution}
              </h3>
              <span className="text-[11px] text-slate-400">
                Monetary Policy Stance & Forward Guidance
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Benchmark Rate:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{centralBank.currentRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Last Decision:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{centralBank.lastDecision} ({centralBank.lastDecisionDate})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Next Rate Decision:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{centralBank.nextDecisionDate}</span>
            </div>
            <p className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{centralBank.recentSpeechOrStatement}"
            </p>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 3. MARKET RELEVANCE (Relevant, NOT guaranteed) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Relevant Markets & Sensitivities
              </h3>
              <span className="text-[11px] text-slate-400">
                Correlated instruments based on sovereign currency and risk transmission
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Observation Only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {relevantMarkets.map((m) => (
            <div key={m.symbol} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold font-mono text-slate-900 dark:text-white block">
                {m.symbol}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                {m.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
