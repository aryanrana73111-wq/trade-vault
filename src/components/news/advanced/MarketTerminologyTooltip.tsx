import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export const FINANCIAL_TERMS: Record<string, string> = {
  'Data Surprise': 'Difference between actual reported economic data and the consensus median forecast.',
  'Risk-off': 'Market environment where investors liquidate riskier assets (equities, high-yield) and allocate toward safe-haven instruments (Gold, US Treasuries, USD).',
  'Yield': 'The annualized interest return on a fixed-income bond, expressed as a percentage of market price.',
  'Basis points (bps)': 'One hundredth of a percentage point (0.01%). For example, 25 bps = 0.25%.',
  'Volatility': 'A statistical measure of the dispersion and magnitude of price fluctuations over a given time interval.',
  'Consensus': 'The aggregated median estimate compiled from institutional economist and analyst surveys prior to data release.',
  'Hawkish': 'Monetary policy stance favoring higher interest rates or balance sheet tightening to combat inflationary pressures.',
  'Dovish': 'Monetary policy stance favoring lower interest rates or monetary accommodation to stimulate economic growth and employment.'
};

interface MarketTerminologyTooltipProps {
  term: keyof typeof FINANCIAL_TERMS | string;
  displayText?: string;
  className?: string;
}

export function MarketTerminologyTooltip({
  term,
  displayText,
  className = ''
}: MarketTerminologyTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const definition = FINANCIAL_TERMS[term] || 'Financial market technical terminology.';

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`underline decoration-dotted decoration-blue-400 dark:decoration-blue-500 underline-offset-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-help font-medium inline-flex items-center gap-0.5 ${className}`}
        aria-label={`Definition for ${term}`}
      >
        <span>{displayText || term}</span>
        <Info className="w-3 h-3 text-blue-500/70 inline shrink-0" />
      </button>

      {isOpen && (
        <div 
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 text-slate-100 text-xs rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          <div className="font-bold text-blue-400 uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
            <span>{term}</span>
            <span className="text-[9px] text-slate-400">Institutional Term</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-normal">
            {definition}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
        </div>
      )}
    </span>
  );
}
