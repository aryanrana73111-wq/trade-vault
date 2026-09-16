import React from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { 
  HelpCircle, 
  Eye, 
  Layers, 
  Scale, 
  Calendar, 
  Building, 
  ExternalLink,
  ShieldCheck,
  Coins,
  LineChart
} from 'lucide-react';

interface IndicatorExplanationSectionProps {
  event: NewsEvent;
  onOpenAcademy?: () => void;
}

export function IndicatorExplanationSection({
  event,
  onOpenAcademy
}: IndicatorExplanationSectionProps) {
  // Derive plain language explanation
  const measuresText = event.whatItMeasures || event.simpleExplanation || 
    `${event.name} tracks macroeconomic variations in sovereign output, labor conditions, or domestic price levels.`;

  const monitoredReason = event.simpleExplanation || 
    `Central banks, fiscal treasuries, and commercial banks monitor ${event.name} to project economic overheating or deceleration, serving as an input for rate decisions.`;

  const sensitivityText = event.whyItMatters || 
    `Changes in ${event.name} often shift short-term sovereign bond yields and foreign exchange carry attractiveness. Assets with direct exposure include ${event.currency} currency crosses, sovereign debt securities, and equity indices.`;

  const relevantAssets = ['Gold (XAU/USD)', `${event.currency} Currency Pairs`, 'Benchmark Government Bonds', 'Equity Index Futures', 'Crypto (BTC/USD)'];

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 overflow-y-auto max-h-[400px] overscroll-contain">
      {/* 1. WHAT IS THIS INDICATOR? */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              What is this Indicator?
            </h2>
          </div>
          {onOpenAcademy && (
            <button
              type="button"
              onClick={onOpenAcademy}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Learn This Concept</span>
              <span>→</span>
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {measuresText}
        </p>

        {/* Indicator Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">What it measures</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {event.category} Momentum
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Frequency</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {event.frequency || 'Monthly'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Measurement Unit</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block font-mono">
              {event.unit || 'Percentage (%)'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Publishing Institution</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {event.source || 'Official National Statistical Bureau'}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* 2. WHY TRADERS CARE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Why Traders Care
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {monitoredReason} {sensitivityText}
        </p>

        {/* Monitored Asset Classes */}
        <div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
            Asset Classes Monitoring this Catalyst:
          </span>
          <div className="flex flex-wrap gap-2">
            {relevantAssets.map(asset => (
              <span 
                key={asset}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                {asset}
              </span>
            ))}
          </div>
        </div>

        {/* Objective Discipline Warning */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Descriptive Analysis Only:</strong> Market reactions depend heavily on pre-release positioning, simultaneous speaker remarks, and broader macro regime. TradeVault never provides guaranteed directional forecasts.
          </span>
        </div>
      </div>
    </div>
  );
}
