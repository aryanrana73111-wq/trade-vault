import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, currency = 'USD') {
  if (value === undefined || value === null || typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatNumber(value: number | null | undefined, decimals = 2) {
  if (value === undefined || value === null || typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return (0).toFixed(decimals);
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function dedupById<T extends { id?: any; [key: string]: any }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item?.id) return false;
    const str = String(item.id);
    if (seen.has(str)) return false;
    seen.add(str);
    return true;
  });
}
