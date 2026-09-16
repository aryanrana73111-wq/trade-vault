// TradeVault - Custom Markets Persistence & Management

export interface MarketOption {
  value: string;
  label: string;
  isCustom?: boolean;
}

export const PREDEFINED_MARKETS: MarketOption[] = [
  { value: 'XAU/USD', label: 'Gold (XAU/USD)' },
  { value: 'BTC/USD', label: 'Bitcoin (BTC/USD)' },
  { value: 'ETH/USD', label: 'Ethereum (ETH/USD)' },
  { value: 'SOL/USD', label: 'Solana (SOL/USD)' },
  { value: 'XRP/USD', label: 'Ripple (XRP/USD)' },
  { value: 'EUR/USD', label: 'EUR/USD' },
  { value: 'GBP/USD', label: 'GBP/USD' },
  { value: 'JPY/USD', label: 'JPY/USD' },
  { value: 'US30', label: 'Dow Jones (US30)' },
  { value: 'NAS100', label: 'Nasdaq 100 (NAS100)' },
  { value: 'SPX500', label: 'S&P 500 (SPX500)' },
  { value: 'WTI', label: 'Crude Oil (WTI)' }
];

const STORAGE_KEY_PREFIX = 'tradevault_custom_markets_';

export function getCustomMarkets(userId?: string): string[] {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId || 'local'}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Check legacy global key fallback
      const fallback = localStorage.getItem('tradevault_custom_markets');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addCustomMarket(marketName: string, userId?: string): string[] {
  const trimmed = marketName.trim();
  if (!trimmed) return getCustomMarkets(userId);

  // Normalize: Keep original user-entered casing or standard uppercase if symbol-like
  const safeName = trimmed.replace(/["'\\]/g, '');

  const existing = getCustomMarkets(userId);
  const isPredefined = PREDEFINED_MARKETS.some(
    m => m.value.toLowerCase() === safeName.toLowerCase() || m.label.toLowerCase() === safeName.toLowerCase()
  );

  const exists = existing.some(m => m.toLowerCase() === safeName.toLowerCase());

  let updated = [...existing];
  if (!isPredefined && !exists) {
    updated = [safeName, ...existing];
    try {
      const key = `${STORAGE_KEY_PREFIX}${userId || 'local'}`;
      localStorage.setItem(key, JSON.stringify(updated));
      localStorage.setItem('tradevault_custom_markets', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('tradevault_custom_markets_updated', { detail: updated }));
    } catch (e) {
      console.error('Failed to save custom market to localStorage', e);
    }
  }

  return updated;
}

export function getAllMarketOptions(userId?: string): MarketOption[] {
  const custom = getCustomMarkets(userId);
  const options: MarketOption[] = [...PREDEFINED_MARKETS];

  custom.forEach(c => {
    if (!options.some(o => o.value.toLowerCase() === c.toLowerCase())) {
      options.push({
        value: c,
        label: `${c} (Custom)`,
        isCustom: true
      });
    }
  });

  return options;
}
