/**
 * TradeVault MT5 Symbol Mapping & Normalization Engine
 * Maps broker-specific MT5 symbol conventions (with prefixes/suffixes) to TradeVault standard markets.
 */

// Canonical dictionary of well-known symbol mappings
const CANONICAL_MAP: Record<string, string> = {
  // Metals & Commodities
  'XAUUSD': 'XAU/USD',
  'GOLD': 'XAU/USD',
  'XAGUSD': 'XAG/USD',
  'SILVER': 'XAG/USD',
  'USOIL': 'USOIL',
  'CRUDE': 'USOIL',
  'WTI': 'USOIL',
  'UKOIL': 'UKOIL',
  'BRENT': 'UKOIL',
  'NGAS': 'NATGAS',

  // Crypto
  'BTCUSD': 'BTC/USD',
  'BTCUSDT': 'BTC/USD',
  'ETHUSD': 'ETH/USD',
  'ETHUSDT': 'ETH/USD',
  'SOLUSD': 'SOL/USD',
  'SOLUSDT': 'SOL/USD',
  'XRPUSD': 'XRP/USD',
  'XRPUSDT': 'XRP/USD',
  'DOGEUSD': 'DOGE/USD',

  // Major Forex Pairs
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'AUDUSD': 'AUD/USD',
  'NZDUSD': 'NZD/USD',
  'USDCAD': 'USD/CAD',
  'USDCHF': 'USD/CHF',

  // Crosses
  'EURGBP': 'EUR/GBP',
  'EURJPY': 'EUR/JPY',
  'GBPJPY': 'GBP/JPY',
  'AUDJPY': 'AUD/JPY',
  'CADJPY': 'CAD/JPY',
  'CHFJPY': 'CHF/JPY',
  'EURCAD': 'EUR/CAD',
  'EURAUD': 'EUR/AUD',
  'GBPAUD': 'GBP/AUD',
  'GBPCAD': 'GBP/CAD',
  'AUDCAD': 'AUD/CAD',
  'NZDJPY': 'NZD/JPY',

  // Indices
  'US30': 'US30',
  'DJ30': 'US30',
  'WS30': 'US30',
  'WALLSTREET': 'US30',
  'NAS100': 'NAS100',
  'USTEC': 'NAS100',
  'US100': 'NAS100',
  'NDX': 'NAS100',
  'SPX500': 'SPX500',
  'US500': 'SPX500',
  'GER40': 'GER40',
  'DAX40': 'GER40',
  'UK100': 'UK100'
};

// Common broker suffixes to strip
const BROKER_SUFFIXES = [
  '.r', '.raw', '.pro', '.ecn', '.std', '.stp', '.c', '.sb',
  'm', 'micro', 'mini', '_sb', '_ecn', '_pro', '!', '#'
];

/**
 * Maps an MT5 broker symbol to a standardized TradeVault market
 */
export function mapMT5SymbolToMarket(rawSymbol: string, customMappings?: Record<string, string>): {
  market: string;
  isMapped: boolean;
  cleanSymbol: string;
} {
  if (!rawSymbol || typeof rawSymbol !== 'string') {
    return { market: 'Unknown', isMapped: false, cleanSymbol: '' };
  }

  const trimmed = rawSymbol.trim();
  const upper = trimmed.toUpperCase();

  // 1. Check custom user/account mappings first
  if (customMappings && customMappings[trimmed]) {
    return { market: customMappings[trimmed], isMapped: true, cleanSymbol: trimmed };
  }
  if (customMappings && customMappings[upper]) {
    return { market: customMappings[upper], isMapped: true, cleanSymbol: upper };
  }

  // 2. Direct lookup in canonical map
  if (CANONICAL_MAP[upper]) {
    return { market: CANONICAL_MAP[upper], isMapped: true, cleanSymbol: upper };
  }

  // 3. Strip broker prefixes/suffixes and check again
  let cleaned = upper;

  // Remove common broker dot or underscore suffixes (e.g., "EURUSD.r", "XAUUSDm")
  for (const suffix of BROKER_SUFFIXES) {
    const sUpper = suffix.toUpperCase();
    if (cleaned.endsWith(sUpper) && cleaned.length > sUpper.length) {
      const candidate = cleaned.slice(0, -sUpper.length);
      if (CANONICAL_MAP[candidate]) {
        return { market: CANONICAL_MAP[candidate], isMapped: true, cleanSymbol: candidate };
      }
      cleaned = candidate;
      break;
    }
  }

  // 4. Check if standard 6-char currency pair
  if (/^[A-Z]{6}$/.test(cleaned)) {
    const base = cleaned.slice(0, 3);
    const quote = cleaned.slice(3, 6);
    return { market: `${base}/${quote}`, isMapped: true, cleanSymbol: cleaned };
  }

  // 5. Unmapped symbol — return explicit unmapped status
  return {
    market: trimmed,
    isMapped: false,
    cleanSymbol: cleaned
  };
}
