/**
 * TradeVault Instrument Specifications & Multi-Asset Risk Engine
 * Accurate contract specs for Forex, Metals, Indices, Crypto, and Energy.
 */

export interface InstrumentSpec {
  symbol: string;
  name: string;
  assetClass: 'FOREX' | 'METALS' | 'INDICES' | 'CRYPTO' | 'COMMODITIES' | 'CUSTOM';
  contractSize: number; // e.g. 100,000 for Forex, 100 for Gold, 1 for Crypto/Indices
  pipSize: number; // 0.0001, 0.01, 1.0
  pointValue: number; // dollar value of 1 point move per 1.0 lot
  quoteCurrency: string;
  baseCurrency: string;
  unitName: string; // 'lots', 'contracts', 'coins'
  minLot: number;
  lotStep: number;
  description: string;
}

export const INSTRUMENT_REGISTRY: Record<string, InstrumentSpec> = {
  // === FOREX MAJORS ===
  'EUR/USD': {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    pointValue: 10, // $10 per pip on 1 standard lot
    quoteCurrency: 'USD',
    baseCurrency: 'EUR',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 EUR. 1 pip (0.0001) = $10.00 USD'
  },
  'GBP/USD': {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    pointValue: 10,
    quoteCurrency: 'USD',
    baseCurrency: 'GBP',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 GBP. 1 pip (0.0001) = $10.00 USD'
  },
  'USD/JPY': {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.01,
    pointValue: 6.70, // dynamically calculated or ~1000 JPY / rate
    quoteCurrency: 'JPY',
    baseCurrency: 'USD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 USD. 1 pip (0.01) = 1,000 JPY (~$6.70 USD)'
  },
  'AUD/USD': {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    pointValue: 10,
    quoteCurrency: 'USD',
    baseCurrency: 'AUD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 AUD. 1 pip (0.0001) = $10.00 USD'
  },
  'USD/CAD': {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    pointValue: 7.30,
    quoteCurrency: 'CAD',
    baseCurrency: 'USD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 USD. 1 pip (0.0001) = 10 CAD'
  },
  'USD/CHF': {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    pointValue: 11.20,
    quoteCurrency: 'CHF',
    baseCurrency: 'USD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 USD. 1 pip (0.0001) = 10 CHF'
  },
  'NZD/USD': {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    pointValue: 10,
    quoteCurrency: 'USD',
    baseCurrency: 'NZD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100,000 NZD. 1 pip (0.0001) = $10.00 USD'
  },

  // === METALS ===
  'XAU/USD': {
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar',
    assetClass: 'METALS',
    contractSize: 100, // 100 troy ounces per lot
    pipSize: 0.01,
    pointValue: 100, // $1.00 move = $100 per 1.0 lot
    quoteCurrency: 'USD',
    baseCurrency: 'XAU',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100 troy oz. A $1.00 price move = $100.00 USD per 1.0 lot ($1 per 0.01 lot)'
  },
  'XAG/USD': {
    symbol: 'XAG/USD',
    name: 'Silver / US Dollar',
    assetClass: 'METALS',
    contractSize: 5000, // 5000 troy ounces per lot
    pipSize: 0.001,
    pointValue: 5000, // $1.00 move = $5,000 per 1.0 lot
    quoteCurrency: 'USD',
    baseCurrency: 'XAG',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 5,000 troy oz. A $1.00 price move = $5,000.00 USD per 1.0 lot'
  },

  // === INDICES ===
  'NAS100': {
    symbol: 'NAS100',
    name: 'Nasdaq 100 Index Cash',
    assetClass: 'INDICES',
    contractSize: 1, // 1 index contract multiplier
    pipSize: 0.1,
    pointValue: 1.0, // 1.0 full index point = $1.00 per 1.0 lot (standard MT5 CFD)
    quoteCurrency: 'USD',
    baseCurrency: 'USD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot CFD = $1.00 per 1.0 index point move (or broker contract multiplier)'
  },
  'US30': {
    symbol: 'US30',
    name: 'Dow Jones Industrial Average 30',
    assetClass: 'INDICES',
    contractSize: 1,
    pipSize: 1.0,
    pointValue: 1.0, // 1 point = $1.00 per 1.0 lot
    quoteCurrency: 'USD',
    baseCurrency: 'USD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot CFD = $1.00 per 1.0 index point move'
  },
  'SPX500': {
    symbol: 'SPX500',
    name: 'S&P 500 Index Cash',
    assetClass: 'INDICES',
    contractSize: 1,
    pipSize: 0.1,
    pointValue: 1.0,
    quoteCurrency: 'USD',
    baseCurrency: 'USD',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot CFD = $1.00 per 1.0 index point move'
  },
  'GER40': {
    symbol: 'GER40',
    name: 'German DAX 40 Index',
    assetClass: 'INDICES',
    contractSize: 1,
    pipSize: 1.0,
    pointValue: 1.08, // €1.00 (~$1.08 USD)
    quoteCurrency: 'EUR',
    baseCurrency: 'EUR',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot CFD = €1.00 per 1.0 index point move'
  },
  'UK100': {
    symbol: 'UK100',
    name: 'UK FTSE 100 Index',
    assetClass: 'INDICES',
    contractSize: 1,
    pipSize: 1.0,
    pointValue: 1.30, // £1.00 (~$1.30 USD)
    quoteCurrency: 'GBP',
    baseCurrency: 'GBP',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot CFD = £1.00 per 1.0 index point move'
  },

  // === CRYPTO ===
  'BTC/USD': {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1, // 1 Bitcoin
    pipSize: 1.0,
    pointValue: 1.0, // $1 move = $1 per 1.0 coin
    quoteCurrency: 'USD',
    baseCurrency: 'BTC',
    unitName: 'BTC',
    minLot: 0.001,
    lotStep: 0.001,
    description: '1.0 lot / coin = $1.00 per $1.00 Bitcoin price change'
  },
  'ETH/USD': {
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1,
    pipSize: 0.1,
    pointValue: 1.0,
    quoteCurrency: 'USD',
    baseCurrency: 'ETH',
    unitName: 'ETH',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot / coin = $1.00 per $1.00 Ethereum price change'
  },
  'SOL/USD': {
    symbol: 'SOL/USD',
    name: 'Solana / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1,
    pipSize: 0.01,
    pointValue: 1.0,
    quoteCurrency: 'USD',
    baseCurrency: 'SOL',
    unitName: 'SOL',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1.0 lot / coin = $1.00 per $1.00 Solana price change'
  },
  'XRP/USD': {
    symbol: 'XRP/USD',
    name: 'Ripple / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1,
    pipSize: 0.0001,
    pointValue: 1.0,
    quoteCurrency: 'USD',
    baseCurrency: 'XRP',
    unitName: 'XRP',
    minLot: 1,
    lotStep: 1,
    description: '1.0 unit = $1.00 per $1.00 Ripple price change'
  },

  // === COMMODITIES ===
  'WTI': {
    symbol: 'WTI',
    name: 'Crude Oil (WTI)',
    assetClass: 'COMMODITIES',
    contractSize: 100, // 100 barrels per standard CFD lot
    pipSize: 0.01,
    pointValue: 100, // $1 move = $100 per lot
    quoteCurrency: 'USD',
    baseCurrency: 'WTI',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100 barrels. A $1.00/bbl move = $100.00 USD'
  },
  'USOIL': {
    symbol: 'USOIL',
    name: 'US Crude Oil',
    assetClass: 'COMMODITIES',
    contractSize: 100,
    pipSize: 0.01,
    pointValue: 100,
    quoteCurrency: 'USD',
    baseCurrency: 'USOIL',
    unitName: 'lots',
    minLot: 0.01,
    lotStep: 0.01,
    description: '1 standard lot = 100 barrels. A $1.00/bbl move = $100.00 USD'
  }
};

/**
 * Normalizes market string to look up specs
 */
export function normalizeMarketKey(market: string): string {
  if (!market) return '';
  const cleaned = market.trim().toUpperCase();
  // Direct match
  if (INSTRUMENT_REGISTRY[cleaned]) return cleaned;
  // Check slash vs no slash
  const withSlash = cleaned.includes('/') ? cleaned : (cleaned.length === 6 ? `${cleaned.slice(0, 3)}/${cleaned.slice(3)}` : cleaned);
  if (INSTRUMENT_REGISTRY[withSlash]) return withSlash;
  // Aliases
  if (cleaned === 'GOLD' || cleaned === 'XAUUSD') return 'XAU/USD';
  if (cleaned === 'SILVER' || cleaned === 'XAGUSD') return 'XAG/USD';
  if (cleaned === 'BTC' || cleaned === 'BTCUSD' || cleaned === 'BTCUSDT') return 'BTC/USD';
  if (cleaned === 'ETH' || cleaned === 'ETHUSD' || cleaned === 'ETHUSDT') return 'ETH/USD';
  if (cleaned === 'SOL' || cleaned === 'SOLUSD' || cleaned === 'SOLUSDT') return 'SOL/USD';
  if (cleaned === 'XRP' || cleaned === 'XRPUSD' || cleaned === 'XRPUSDT') return 'XRP/USD';
  if (cleaned === 'USTEC' || cleaned === 'US100' || cleaned === 'NDX') return 'NAS100';
  if (cleaned === 'DJ30' || cleaned === 'WS30' || cleaned === 'WALLSTREET') return 'US30';
  if (cleaned === 'US500' || cleaned === 'SPX') return 'SPX500';
  if (cleaned === 'DAX' || cleaned === 'DAX40') return 'GER40';
  if (cleaned === 'CRUDE' || cleaned === 'OIL') return 'WTI';
  return cleaned;
}

export function getInstrumentSpecification(market: string): InstrumentSpec | null {
  const key = normalizeMarketKey(market);
  return INSTRUMENT_REGISTRY[key] || null;
}

export interface RiskCalculationResult {
  calculable: boolean;
  riskAmount?: number;
  reason?: string;
  formula?: string;
  specUsed?: InstrumentSpec;
  stopDistance?: number;
  pipDistance?: number;
}

/**
 * Calculates exact monetary risk amount given Market, Entry, Stop Loss, and Lot Size.
 * Strictly adheres to real instrument specifications. Does not guess missing specs.
 */
export function calculateRiskAmountFromLot(params: {
  market: string;
  entry: number;
  stopLoss: number;
  lot: number;
  direction?: 'BUY' | 'SELL';
  accountCurrency?: string;
}): RiskCalculationResult {
  const { market, entry, stopLoss, lot, direction = 'BUY', accountCurrency = 'USD' } = params;

  if (!market || !entry || !stopLoss || !lot || entry <= 0 || stopLoss <= 0 || lot <= 0) {
    return {
      calculable: false,
      reason: 'Incomplete price or lot parameters.'
    };
  }

  const stopDistance = Math.abs(entry - stopLoss);
  if (stopDistance <= 0) {
    return {
      calculable: false,
      reason: 'Entry price equals Stop Loss.'
    };
  }

  const spec = getInstrumentSpecification(market);
  if (!spec) {
    return {
      calculable: false,
      reason: 'Risk cannot be calculated reliably because instrument specifications are missing.'
    };
  }

  let calculatedRisk = 0;
  let formula = '';

  if (spec.assetClass === 'FOREX') {
    if (spec.quoteCurrency === 'USD') {
      // Direct USD quote e.g. EUR/USD: pipSize 0.0001 = $10/lot
      const pips = stopDistance / spec.pipSize;
      calculatedRisk = pips * spec.pointValue * lot;
      formula = `${pips.toFixed(1)} pips × $${spec.pointValue}/lot × ${lot} lots`;
    } else if (spec.baseCurrency === 'USD') {
      // USD base e.g. USD/JPY: pipValue = 1000 JPY / entry
      const pips = stopDistance / spec.pipSize;
      const pipValueInUSD = (spec.contractSize * spec.pipSize) / entry;
      calculatedRisk = pips * pipValueInUSD * lot;
      formula = `${pips.toFixed(1)} pips × $${pipValueInUSD.toFixed(3)}/lot × ${lot} lots`;
    } else {
      // Cross currency: approximate with contractSize * stopDistance
      const pips = stopDistance / spec.pipSize;
      calculatedRisk = pips * spec.pointValue * lot;
      formula = `${pips.toFixed(1)} pips × $${spec.pointValue}/lot × ${lot} lots`;
    }
  } else if (spec.assetClass === 'METALS') {
    // Gold: $1 move = $100 per 1.0 lot. Risk = stopDistance * contractSize * lot
    calculatedRisk = stopDistance * spec.contractSize * lot;
    formula = `$${stopDistance.toFixed(2)} price move × ${spec.contractSize} oz × ${lot} lots`;
  } else if (spec.assetClass === 'INDICES') {
    // Indices CFD: pointValue * stopDistance * lot
    calculatedRisk = stopDistance * spec.pointValue * lot;
    formula = `${stopDistance.toFixed(2)} points × $${spec.pointValue}/point × ${lot} lots`;
  } else if (spec.assetClass === 'CRYPTO') {
    // Crypto: stopDistance * lot
    calculatedRisk = stopDistance * spec.contractSize * lot;
    formula = `$${stopDistance.toFixed(2)} move × ${lot} ${spec.unitName}`;
  } else if (spec.assetClass === 'COMMODITIES') {
    calculatedRisk = stopDistance * spec.contractSize * lot;
    formula = `$${stopDistance.toFixed(2)} move × ${spec.contractSize} bbl × ${lot} lots`;
  } else {
    calculatedRisk = stopDistance * spec.pointValue * lot;
    formula = `${stopDistance.toFixed(2)} × ${spec.pointValue} × ${lot}`;
  }

  calculatedRisk = Number(calculatedRisk.toFixed(2));

  return {
    calculable: true,
    riskAmount: calculatedRisk,
    formula,
    specUsed: spec,
    stopDistance,
    pipDistance: spec.pipSize > 0 ? Number((stopDistance / spec.pipSize).toFixed(1)) : undefined
  };
}

/**
 * Calculates Realized P&L from Entry, Exit, Lot, and Direction
 */
export function calculateRealizedPnlFromExit(params: {
  market: string;
  entry: number;
  exit: number;
  lot: number;
  direction: 'BUY' | 'SELL';
  commission?: number;
  swap?: number;
}): { calculable: boolean; pnl?: number; grossPnl?: number; reason?: string } {
  const { market, entry, exit, lot, direction, commission = 0, swap = 0 } = params;
  if (!market || !entry || !exit || !lot || entry <= 0 || exit <= 0 || lot <= 0) {
    return { calculable: false, reason: 'Missing price or volume parameters.' };
  }

  const spec = getInstrumentSpecification(market);
  if (!spec) {
    return { calculable: false, reason: 'Instrument specifications missing.' };
  }

  const priceDiff = direction === 'BUY' ? (exit - entry) : (entry - exit);
  let grossPnl = 0;

  if (spec.assetClass === 'FOREX') {
    const pips = priceDiff / spec.pipSize;
    if (spec.quoteCurrency === 'USD') {
      grossPnl = pips * spec.pointValue * lot;
    } else if (spec.baseCurrency === 'USD') {
      const pipValueInUSD = (spec.contractSize * spec.pipSize) / exit;
      grossPnl = pips * pipValueInUSD * lot;
    } else {
      grossPnl = pips * spec.pointValue * lot;
    }
  } else if (spec.assetClass === 'METALS' || spec.assetClass === 'COMMODITIES') {
    grossPnl = priceDiff * spec.contractSize * lot;
  } else if (spec.assetClass === 'INDICES') {
    grossPnl = priceDiff * spec.pointValue * lot;
  } else if (spec.assetClass === 'CRYPTO') {
    grossPnl = priceDiff * spec.contractSize * lot;
  } else {
    grossPnl = priceDiff * lot;
  }

  const netPnl = grossPnl + (commission || 0) + (swap || 0);

  return {
    calculable: true,
    grossPnl: Number(grossPnl.toFixed(2)),
    pnl: Number(netPnl.toFixed(2))
  };
}

/**
 * Smart Result Auto-Fill Engine
 * Implements Rule 11 priority:
 * 1. Actual Exit Price available -> calculate actual realized P&L
 * 2. Actual MT5 screenshot data available -> use extracted P&L
 * 3. Exit Price entered manually -> calculate P&L
 * 4. TP entered and user enabled "Use TP as exit" -> calculate suggested P&L
 * 5. Quick Result Mode enabled -> WIN: +Risk Amount, LOSS: -Risk Amount, BREAK EVEN: 0 (labeled "Estimated 1R shortcut")
 * 6. None of the above -> DO NOT invent P&L. Inform user: "Realized P&L needs an exit price or actual result."
 */
export function calculateSuggestedResultPnl(params: {
  result: 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | '';
  riskAmount?: number;
  quickResultMode?: boolean;
  exitPrice?: number;
  entryPrice?: number;
  lot?: number;
  market?: string;
  direction?: 'BUY' | 'SELL';
  tpPrice?: number;
  useTpAsExit?: boolean;
  extractedMt5Pnl?: number;
}): {
  pnl: number | null;
  source: 'actual_exit' | 'mt5_screenshot' | 'tp_as_exit' | 'quick_result_1r' | null;
  sourceLabel?: string;
  isShortcut?: boolean;
  message?: string;
} {
  const {
    result,
    riskAmount,
    quickResultMode,
    exitPrice,
    entryPrice,
    lot,
    market,
    direction = 'BUY',
    tpPrice,
    useTpAsExit,
    extractedMt5Pnl
  } = params;

  if (!result || result === 'PENDING') {
    return { pnl: null, source: null, message: result === 'PENDING' ? 'Trade is pending. Realized P&L will not be calculated.' : undefined };
  }

  if (result === 'BREAK EVEN') {
    return { pnl: 0, source: 'quick_result_1r', sourceLabel: 'Break Even ($0.00)', isShortcut: false };
  }

  // Priority 1 & 3: Actual Exit Price or manually entered exit price
  if (exitPrice && entryPrice && lot && market) {
    const calc = calculateRealizedPnlFromExit({
      market,
      entry: entryPrice,
      exit: exitPrice,
      lot,
      direction
    });
    if (calc.calculable && calc.pnl !== undefined) {
      return {
        pnl: calc.pnl,
        source: 'actual_exit',
        sourceLabel: `Calculated from Exit (${exitPrice})`,
        isShortcut: false
      };
    }
  }

  // Priority 2: Actual MT5 screenshot data available
  if (extractedMt5Pnl !== undefined && extractedMt5Pnl !== null && !isNaN(extractedMt5Pnl)) {
    return {
      pnl: extractedMt5Pnl,
      source: 'mt5_screenshot',
      sourceLabel: 'Extracted from MT5 Screenshot',
      isShortcut: false
    };
  }

  // Priority 4: TP entered and user explicitly enables "Use TP as exit"
  if (useTpAsExit && tpPrice && entryPrice && lot && market) {
    const calc = calculateRealizedPnlFromExit({
      market,
      entry: entryPrice,
      exit: tpPrice,
      lot,
      direction
    });
    if (calc.calculable && calc.pnl !== undefined) {
      return {
        pnl: calc.pnl,
        source: 'tp_as_exit',
        sourceLabel: `Suggested from TP (${tpPrice})`,
        isShortcut: false
      };
    }
  }

  // Priority 5: Quick Result Mode (1R shortcut)
  if (quickResultMode && riskAmount && riskAmount > 0) {
    const pnl = result === 'WIN' ? riskAmount : -riskAmount;
    return {
      pnl,
      source: 'quick_result_1r',
      sourceLabel: 'Estimated 1R shortcut',
      isShortcut: true
    };
  }

  // Priority 6: None of the above - DO NOT invent exact realized P&L
  return {
    pnl: null,
    source: null,
    message: 'Realized P&L needs an exit price or actual result.'
  };
}
