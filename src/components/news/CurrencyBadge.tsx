import React from 'react';

export const COUNTRY_FLAG_MAP: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  NZD: '🇳🇿',
  CNY: '🇨🇳',
  CNH: '🇨🇳',
  INR: '🇮🇳',
  SGD: '🇸🇬',
  HKD: '🇭🇰',
  SEK: '🇸🇪',
  NOK: '🇳🇴',
  KRW: '🇰🇷',
  BRL: '🇧🇷',
  MXN: '🇲🇽',
  ZAR: '🇿🇦',
  WW: '🌐'
};

export const CURRENCY_OPTIONS = [
  { code: 'ALL', label: 'All Currencies', name: 'Global Markets' },
  { code: 'USD', label: 'USD — US Dollar', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', label: 'EUR — Euro', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', label: 'GBP — British Pound', flag: '🇬🇧', name: 'British Pound' },
  { code: 'JPY', label: 'JPY — Japanese Yen', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'AUD', label: 'AUD — Australian Dollar', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'CHF', label: 'CHF — Swiss Franc', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar', flag: '🇳🇿', name: 'New Zealand Dollar' },
  { code: 'CNY', label: 'CNY — Chinese Yuan', flag: '🇨🇳', name: 'Chinese Yuan' },
];

export const CURRENCY_FULL_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  NZD: 'New Zealand Dollar',
  CNY: 'Chinese Yuan',
  CNH: 'Offshore Yuan',
  INR: 'Indian Rupee',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  KRW: 'South Korean Won',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  ZAR: 'South African Rand',
  WW: 'Global / Multi-Currency'
};

export interface CurrencyBadgeProps {
  code: string;
  name?: string;
  country?: string;
  showFullName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CurrencyBadge({
  code,
  name,
  country,
  showFullName = false,
  size = 'md',
  className = ''
}: CurrencyBadgeProps) {
  const flag = COUNTRY_FLAG_MAP[code.toUpperCase()] || '🌐';
  const fullName = name || CURRENCY_FULL_NAMES[code.toUpperCase()] || code;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-bold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 ${sizeClasses} ${className}`}
      title={`${fullName} (${code}) ${country ? `— ${country}` : ''}`}
      aria-label={`${fullName}, ${code}`}
    >
      <span className="text-sm leading-none" role="img" aria-label={code}>
        {flag}
      </span>
      <span>{code.toUpperCase()}</span>
      {showFullName && (
        <span className="text-[11px] font-sans font-normal text-slate-600 dark:text-slate-400">
          {fullName}
        </span>
      )}
    </span>
  );
}
