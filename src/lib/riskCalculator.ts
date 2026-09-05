import { 
  AssetClass, 
  Direction, 
  InstrumentSpecification, 
  CalculatorInput, 
  CalculatorResult, 
  CalculationStep 
} from '@/types';

// Standard Pre-configured Instruments
export const DEFAULT_INSTRUMENTS: InstrumentSpecification[] = [
  // FOREX MAJOR & CROSS PAIRS
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Standard Forex Lot = 100,000 EUR. 1 pip = 0.0001 ($10/lot in USD).'
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Standard Forex Lot = 100,000 GBP. 1 pip = 0.0001 ($10/lot in USD).'
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.01,
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'JPY pair: 1 pip = 0.01 JPY. 1 lot pip value = 1,000 JPY / USDJPY rate.'
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Base USD pair: 1 pip = 0.0001 CHF. 1 lot pip value = 10 CHF / USDCHF rate.'
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Base USD pair: 1 pip = 0.0001 CAD. 1 lot pip value = 10 CAD / USDCAD rate.'
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'AUD',
    quoteCurrency: 'USD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Standard Forex Lot = 100,000 AUD. 1 pip = 0.0001 ($10/lot in USD).'
  },
  {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'NZD',
    quoteCurrency: 'USD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Standard Forex Lot = 100,000 NZD. 1 pip = 0.0001 ($10/lot in USD).'
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.0001,
    baseCurrency: 'EUR',
    quoteCurrency: 'GBP',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Cross pair: 1 pip = 10 GBP/lot. Converted to account currency via GBP/Account rate.'
  },
  {
    symbol: 'EUR/JPY',
    name: 'Euro / Japanese Yen',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.01,
    baseCurrency: 'EUR',
    quoteCurrency: 'JPY',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'JPY cross: 1 pip = 1,000 JPY/lot. Converted to account currency via JPY/Account rate.'
  },
  {
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    assetClass: 'FOREX',
    contractSize: 100000,
    pipSize: 0.01,
    baseCurrency: 'GBP',
    quoteCurrency: 'JPY',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'JPY cross: 1 pip = 1,000 JPY/lot. Converted to account currency via JPY/Account rate.'
  },

  // METALS
  {
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar',
    assetClass: 'METALS',
    contractSize: 100, // 100 troy ounces per lot standard
    pipSize: 0.01,
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: '1 standard lot = 100 troy oz. $1.00 move = $100/lot. Adjustable for micro/mini broker contracts.'
  },
  {
    symbol: 'XAG/USD',
    name: 'Silver / US Dollar',
    assetClass: 'METALS',
    contractSize: 5000, // 5,000 troy ounces per lot standard
    pipSize: 0.001,
    baseCurrency: 'XAG',
    quoteCurrency: 'USD',
    unitName: 'lots',
    contractType: 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: '1 standard lot = 5,000 troy oz. $1.00 move = $5,000/lot. Configurable per broker.'
  },

  // CRYPTO
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1, // 1 coin for spot
    pipSize: 1,
    baseCurrency: 'BTC',
    quoteCurrency: 'USD',
    unitName: 'BTC',
    contractType: 'Spot',
    minPositionSize: 0.0001,
    positionStep: 0.0001,
    notes: 'Spot/Coin sizing: Position Size = Risk ÷ |Entry - SL|. Or switch to contracts in advanced settings.'
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1,
    pipSize: 0.1,
    baseCurrency: 'ETH',
    quoteCurrency: 'USD',
    unitName: 'ETH',
    contractType: 'Spot',
    minPositionSize: 0.001,
    positionStep: 0.001,
    notes: 'Spot/Coin sizing: Position Size = Risk ÷ |Entry - SL|.'
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1,
    pipSize: 0.01,
    baseCurrency: 'SOL',
    quoteCurrency: 'USD',
    unitName: 'SOL',
    contractType: 'Spot',
    minPositionSize: 0.01,
    positionStep: 0.01,
    notes: 'Spot/Coin sizing: Position Size = Risk ÷ |Entry - SL|.'
  },
  {
    symbol: 'XRP/USD',
    name: 'Ripple / US Dollar',
    assetClass: 'CRYPTO',
    contractSize: 1,
    pipSize: 0.0001,
    baseCurrency: 'XRP',
    quoteCurrency: 'USD',
    unitName: 'XRP',
    contractType: 'Spot',
    minPositionSize: 1,
    positionStep: 1,
    notes: 'Spot/Coin sizing: Position Size = Risk ÷ |Entry - SL|.'
  },
];

export const COMMON_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'INR'
];

export const RISK_PRESETS = [0.25, 0.5, 1.0, 2.0];

export const RISK_SCENARIO_PERCENTAGES = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];

/**
 * Creates a template custom instrument
 */
export function createCustomInstrument(symbol = 'CUSTOM/USD', assetClass: AssetClass = 'CUSTOM'): InstrumentSpecification {
  return {
    symbol,
    name: 'Custom Instrument',
    assetClass,
    contractSize: assetClass === 'FOREX' ? 100000 : (assetClass === 'METALS' ? 100 : 1),
    pipSize: assetClass === 'FOREX' ? 0.0001 : 0.01,
    baseCurrency: symbol.split('/')[0] || 'BASE',
    quoteCurrency: symbol.split('/')[1] || 'USD',
    unitName: assetClass === 'FOREX' || assetClass === 'METALS' ? 'lots' : 'units',
    contractType: assetClass === 'CRYPTO' ? 'Spot' : 'CFD',
    minPositionSize: 0.01,
    positionStep: 0.01,
    isCustom: true,
    notes: 'Custom user-specified broker contract specification.'
  };
}

/**
 * Validates the core trade setup inputs
 */
export function validateCalculatorInput(input: CalculatorInput): { 
  isValid: boolean; 
  error?: string; 
  directionWarning?: string; 
} {
  const { accountBalance, riskPercent, riskAmount, entry, stopLoss, takeProfit, direction } = input;

  if (accountBalance <= 0) {
    return { isValid: false, error: 'Account balance must be greater than zero.' };
  }

  if (riskPercent <= 0 && riskAmount <= 0) {
    return { isValid: false, error: 'Risk must be greater than zero.' };
  }

  if (entry <= 0) {
    return { isValid: false, error: 'Entry price must be greater than zero.' };
  }

  if (stopLoss <= 0) {
    return { isValid: false, error: 'Stop loss price must be greater than zero.' };
  }

  if (Math.abs(entry - stopLoss) < 1e-9) {
    return { isValid: false, error: 'Stop loss cannot equal the entry price.' };
  }

  // Direction validation
  if (direction === 'BUY' && stopLoss >= entry) {
    return { 
      isValid: false, 
      error: 'For a BUY setup, Stop Loss must be strictly below Entry Price.' 
    };
  }

  if (direction === 'SELL' && stopLoss <= entry) {
    return { 
      isValid: false, 
      error: 'For a SELL setup, Stop Loss must be strictly above Entry Price.' 
    };
  }

  let directionWarning: string | undefined;

  // Take Profit validation (optional)
  if (takeProfit && takeProfit > 0) {
    if (direction === 'BUY' && takeProfit <= entry) {
      directionWarning = 'Warning: For a BUY setup, Take Profit is typically above Entry Price.';
    } else if (direction === 'SELL' && takeProfit >= entry) {
      directionWarning = 'Warning: For a SELL setup, Take Profit is typically below Entry Price.';
    }
  }

  return { isValid: true, directionWarning };
}

/**
 * Rounds a number to the nearest broker position step (e.g. 0.01)
 * while ensuring it is at least minPositionSize.
 */
export function roundToBrokerStep(val: number, step = 0.01, min = 0.01): number {
  if (val <= 0 || !isFinite(val)) return 0;
  if (step <= 0) return Number(val.toFixed(4));

  const factor = 1 / step;
  let stepped = Math.floor(val * factor) / factor;
  
  if (stepped < min && val >= min * 0.5) {
    stepped = min;
  }

  // Determine decimals based on step
  const stepStr = step.toString();
  const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  return Number(stepped.toFixed(Math.max(decimals, 2)));
}

/**
 * Primary calculation engine supporting FOREX, GOLD/METALS, CRYPTO, and CUSTOM
 */
export function calculatePositionSize(input: CalculatorInput, maxConfiguredRiskPercent?: number): CalculatorResult {
  const validation = validateCalculatorInput(input);
  if (!validation.isValid) {
    return {
      isValid: false,
      validationError: validation.error,
      directionWarning: validation.directionWarning,
      positionSize: 0,
      roundedPositionSize: 0,
      unitLabel: input.specification.unitName || 'units',
      stopLossDistance: 0,
      stopLossPipsOrTicks: 0,
      estimatedLoss: 0,
      actualRiskPercent: 0,
      marginCalculable: false,
      steps: []
    };
  }

  const { 
    accountBalance, 
    accountCurrency, 
    riskPercent, 
    riskAmount: rawRiskAmount, 
    riskMode,
    entry, 
    stopLoss, 
    takeProfit, 
    direction,
    leverage,
    quoteToAccountRate = 1,
    specification 
  } = input;

  // Derive target risk amount cleanly
  const riskAmount = riskMode === 'amount' 
    ? rawRiskAmount 
    : (accountBalance * (riskPercent / 100));

  const effectiveRiskPercent = (riskAmount / accountBalance) * 100;

  // Price distance
  const stopLossDistance = Math.abs(entry - stopLoss);
  const pipSize = specification.pipSize > 0 ? specification.pipSize : 0.0001;
  const stopLossPipsOrTicks = Number((stopLossDistance / pipSize).toFixed(2));

  let positionSize = 0;
  let equivalentUnits: number | undefined;
  let equivalentUnitsLabel: string | undefined;
  let unitLabel = specification.unitName || 'units';
  let conversionNote: string | undefined;
  const steps: CalculationStep[] = [];

  steps.push({
    label: 'Account Risk Target',
    formula: riskMode === 'amount' 
      ? `Entered Risk Amount` 
      : `Account Balance × Risk % = ${accountBalance.toLocaleString()} × ${riskPercent}%`,
    detail: `${accountCurrency} ${riskAmount.toFixed(2)} (${effectiveRiskPercent.toFixed(2)}% of account)`
  });

  steps.push({
    label: 'Stop Loss Distance',
    formula: `|Entry (${entry}) - Stop Loss (${stopLoss})|`,
    detail: `${stopLossDistance.toFixed(Math.max(2, getDecimals(pipSize)))} (${stopLossPipsOrTicks} pips/ticks)`
  });

  // ASSET CLASS SPECIFIC LOGIC
  if (specification.assetClass === 'FOREX') {
    const contractSize = specification.contractSize || 100000;
    const isBaseAccount = specification.baseCurrency === accountCurrency;
    const isQuoteAccount = specification.quoteCurrency === accountCurrency;

    let pipValueInAccountPerLot = 0;

    if (isQuoteAccount) {
      // Direct pair where quote is account currency (e.g. EUR/USD with USD account)
      pipValueInAccountPerLot = contractSize * pipSize;
      steps.push({
        label: 'Pip Value per Standard Lot',
        formula: `Contract Size (${contractSize.toLocaleString()}) × Pip Size (${pipSize})`,
        detail: `${accountCurrency} ${pipValueInAccountPerLot.toFixed(2)} per pip/lot`
      });
    } else if (isBaseAccount) {
      // Base is account currency (e.g. USD/JPY, USD/CAD with USD account)
      // Pip value in quote currency = contractSize * pipSize (e.g. 100,000 * 0.01 = 1,000 JPY)
      // In account currency = (contractSize * pipSize) / Entry
      pipValueInAccountPerLot = (contractSize * pipSize) / entry;
      steps.push({
        label: 'Pip Value per Standard Lot',
        formula: `(Contract Size × Pip Size) ÷ Entry Price = (${contractSize.toLocaleString()} × ${pipSize}) ÷ ${entry}`,
        detail: `${accountCurrency} ${pipValueInAccountPerLot.toFixed(4)} per pip/lot`
      });
    } else {
      // Cross currency pair (e.g. EUR/GBP or EUR/JPY with USD account)
      const pipValueInQuote = contractSize * pipSize;
      if (quoteToAccountRate && quoteToAccountRate > 0 && quoteToAccountRate !== 1) {
        pipValueInAccountPerLot = pipValueInQuote * quoteToAccountRate;
        conversionNote = `Converted from ${specification.quoteCurrency} to ${accountCurrency} at rate ${quoteToAccountRate}`;
      } else {
        // Direct rate assumption or prompt
        pipValueInAccountPerLot = pipValueInQuote;
        conversionNote = `Assuming 1:1 quote-to-account rate (${specification.quoteCurrency} → ${accountCurrency}). Adjust in Advanced Settings if your broker uses a conversion rate.`;
      }

      steps.push({
        label: 'Pip Value per Standard Lot',
        formula: `Contract Size × Pip Size × Conversion Rate = ${contractSize.toLocaleString()} × ${pipSize} × ${quoteToAccountRate}`,
        detail: `${accountCurrency} ${pipValueInAccountPerLot.toFixed(4)} per pip/lot`
      });
    }

    const lossPerLotAtStop = stopLossPipsOrTicks * pipValueInAccountPerLot;
    if (lossPerLotAtStop > 0) {
      positionSize = riskAmount / lossPerLotAtStop;
    }

    equivalentUnits = positionSize * contractSize;
    equivalentUnitsLabel = `${equivalentUnits.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${specification.baseCurrency} units`;
    unitLabel = 'lots';

    steps.push({
      label: 'Loss per Standard Lot at Stop',
      formula: `Stop Distance (${stopLossPipsOrTicks} pips) × Pip Value (${pipValueInAccountPerLot.toFixed(4)})`,
      detail: `${accountCurrency} ${lossPerLotAtStop.toFixed(2)} per standard lot`
    });

    steps.push({
      label: 'Position Size (Lots)',
      formula: `Risk Amount (${riskAmount.toFixed(2)}) ÷ Loss per Lot (${lossPerLotAtStop.toFixed(2)})`,
      detail: `${positionSize.toFixed(4)} lots (${equivalentUnitsLabel})`
    });

  } else if (specification.assetClass === 'METALS') {
    // Gold / Silver
    const contractSize = specification.contractSize || 100; // e.g. 100 oz for XAU/USD
    let lossPerLotAtStop = stopLossDistance * contractSize;

    if (specification.quoteCurrency !== accountCurrency && quoteToAccountRate > 0) {
      lossPerLotAtStop = lossPerLotAtStop * quoteToAccountRate;
      conversionNote = `Converted from ${specification.quoteCurrency} to ${accountCurrency} at rate ${quoteToAccountRate}`;
    }

    if (lossPerLotAtStop > 0) {
      positionSize = riskAmount / lossPerLotAtStop;
    }

    equivalentUnits = positionSize * contractSize;
    equivalentUnitsLabel = `${equivalentUnits.toFixed(2)} oz total exposure`;
    unitLabel = 'lots';

    steps.push({
      label: 'Loss per Lot at Stop',
      formula: `Price Distance (${stopLossDistance.toFixed(2)}) × Contract Size (${contractSize} oz)`,
      detail: `${accountCurrency} ${lossPerLotAtStop.toFixed(2)} per lot`
    });

    steps.push({
      label: 'Position Size (Lots)',
      formula: `Risk Amount (${riskAmount.toFixed(2)}) ÷ Loss per Lot (${lossPerLotAtStop.toFixed(2)})`,
      detail: `${positionSize.toFixed(4)} lots (${equivalentUnitsLabel})`
    });

  } else if (specification.assetClass === 'CRYPTO') {
    const isContractDerivative = specification.contractType === 'Futures' || 
                                 specification.contractType === 'Perpetual' || 
                                 specification.contractType === 'CFD';

    if (isContractDerivative && specification.contractSize && specification.contractSize > 1) {
      // Contract-based derivatives
      const contractSize = specification.contractSize;
      const lossPerContract = stopLossDistance * contractSize;
      if (lossPerContract > 0) {
        positionSize = riskAmount / lossPerContract;
      }
      unitLabel = 'contracts';
      equivalentUnits = positionSize * contractSize;
      equivalentUnitsLabel = `${equivalentUnits.toFixed(4)} ${specification.baseCurrency}`;

      steps.push({
        label: 'Loss per Contract at Stop',
        formula: `Stop Distance (${stopLossDistance}) × Contract Multiplier (${contractSize})`,
        detail: `${accountCurrency} ${lossPerContract.toFixed(2)} per contract`
      });

      steps.push({
        label: 'Position Size (Contracts)',
        formula: `Risk Amount (${riskAmount.toFixed(2)}) ÷ Loss per Contract (${lossPerContract.toFixed(2)})`,
        detail: `${positionSize.toFixed(4)} contracts`
      });
    } else {
      // Spot / Unit based crypto
      // Position Size (coins) = Risk Amount / Stop Loss Distance
      let lossPerCoin = stopLossDistance;
      if (specification.quoteCurrency !== accountCurrency && quoteToAccountRate > 0) {
        lossPerCoin = lossPerCoin * quoteToAccountRate;
        conversionNote = `Converted from ${specification.quoteCurrency} to ${accountCurrency} at rate ${quoteToAccountRate}`;
      }

      if (lossPerCoin > 0) {
        positionSize = riskAmount / lossPerCoin;
      }
      unitLabel = specification.baseCurrency || 'coins';

      steps.push({
        label: 'Position Size (Coins / Units)',
        formula: `Risk Amount (${riskAmount.toFixed(2)}) ÷ Stop Distance (${stopLossDistance.toFixed(2)})`,
        detail: `${positionSize.toFixed(6)} ${unitLabel}`
      });
    }

  } else {
    // Custom Asset Class
    const contractSize = specification.contractSize || 1;
    let lossPerUnit = stopLossDistance * contractSize;

    if (specification.quoteCurrency !== accountCurrency && quoteToAccountRate > 0) {
      lossPerUnit = lossPerUnit * quoteToAccountRate;
    }

    if (lossPerUnit > 0) {
      positionSize = riskAmount / lossPerUnit;
    }

    unitLabel = specification.unitName || 'units';
    if (contractSize > 1) {
      equivalentUnits = positionSize * contractSize;
      equivalentUnitsLabel = `${equivalentUnits.toFixed(2)} total base units`;
    }

    steps.push({
      label: 'Position Size',
      formula: `Risk Amount (${riskAmount.toFixed(2)}) ÷ Loss per Unit (${lossPerUnit.toFixed(2)})`,
      detail: `${positionSize.toFixed(4)} ${unitLabel}`
    });
  }

  // Broker-stepped rounded size
  const roundedPositionSize = roundToBrokerStep(
    positionSize, 
    specification.positionStep || 0.01, 
    specification.minPositionSize || 0.01
  );

  // Recalculate estimated loss at stop using stepped position size
  let estimatedLoss = riskAmount;
  if (positionSize > 0 && roundedPositionSize > 0) {
    // Actual risk using the rounded size
    estimatedLoss = (riskAmount / positionSize) * roundedPositionSize;
  }
  const actualRiskPercent = (estimatedLoss / accountBalance) * 100;

  // Notional Value
  let notionalValue: number | undefined;
  if (specification.assetClass === 'FOREX') {
    // Standard forex notional = Lots * Contract Size * (Base-to-Account price)
    // If quote is account: Lots * Contract Size * Entry
    // If base is account: Lots * Contract Size
    if (specification.quoteCurrency === accountCurrency) {
      notionalValue = roundedPositionSize * specification.contractSize * entry;
    } else if (specification.baseCurrency === accountCurrency) {
      notionalValue = roundedPositionSize * specification.contractSize;
    } else {
      notionalValue = roundedPositionSize * specification.contractSize * entry * (quoteToAccountRate || 1);
    }
  } else if (specification.assetClass === 'METALS') {
    notionalValue = roundedPositionSize * specification.contractSize * entry * (quoteToAccountRate || 1);
  } else {
    // Crypto / Custom
    const effectiveCoins = equivalentUnits || roundedPositionSize;
    notionalValue = effectiveCoins * entry * (quoteToAccountRate || 1);
  }

  // Margin Calculation
  let estimatedMargin: number | undefined;
  let marginCalculable = false;
  let marginNote: string | undefined;

  if (leverage && leverage > 0 && notionalValue && notionalValue > 0) {
    estimatedMargin = notionalValue / leverage;
    marginCalculable = true;
    marginNote = `Estimated required margin at 1:${leverage} leverage based on current notional value.`;
  } else if (leverage && leverage > 0) {
    marginCalculable = false;
    marginNote = 'Broker-specific margin calculation required.';
  } else {
    marginNote = 'Leverage not specified. Leverage affects required margin, not loss at stop.';
  }

  // Take Profit & R:R Metrics (optional)
  let takeProfitDistance: number | undefined;
  let takeProfitPipsOrTicks: number | undefined;
  let potentialProfit: number | undefined;
  let riskRewardRatio: number | undefined;

  if (takeProfit && takeProfit > 0) {
    takeProfitDistance = Math.abs(takeProfit - entry);
    takeProfitPipsOrTicks = Number((takeProfitDistance / pipSize).toFixed(2));

    if (stopLossDistance > 0) {
      riskRewardRatio = Number((takeProfitDistance / stopLossDistance).toFixed(2));
      potentialProfit = estimatedLoss * riskRewardRatio;
    }
  }

  // Risk Guardrail Warning
  let riskWarning: string | undefined;
  if (maxConfiguredRiskPercent && maxConfiguredRiskPercent > 0) {
    if (effectiveRiskPercent > maxConfiguredRiskPercent) {
      riskWarning = `⚠️ This position (${effectiveRiskPercent.toFixed(2)}%) exceeds your configured ${maxConfiguredRiskPercent}% maximum trade risk limit.`;
    }
  }

  return {
    isValid: true,
    directionWarning: validation.directionWarning,
    riskWarning,
    positionSize,
    roundedPositionSize,
    unitLabel,
    equivalentUnits,
    equivalentUnitsLabel,
    stopLossDistance,
    stopLossPipsOrTicks,
    estimatedLoss: Number(estimatedLoss.toFixed(2)),
    actualRiskPercent: Number(actualRiskPercent.toFixed(2)),
    takeProfitDistance: takeProfitDistance ? Number(takeProfitDistance.toFixed(Math.max(2, getDecimals(pipSize)))) : undefined,
    takeProfitPipsOrTicks,
    potentialProfit: potentialProfit ? Number(potentialProfit.toFixed(2)) : undefined,
    riskRewardRatio,
    notionalValue: notionalValue ? Number(notionalValue.toFixed(2)) : undefined,
    estimatedMargin: estimatedMargin ? Number(estimatedMargin.toFixed(2)) : undefined,
    marginCalculable,
    marginNote,
    conversionNote,
    steps
  };
}

/**
 * Calculates risk scenarios across multiple percentages
 */
export function calculateRiskScenarios(
  baseInput: CalculatorInput, 
  scenarios = RISK_SCENARIO_PERCENTAGES,
  maxConfiguredRisk?: number
): Array<{
  percent: number;
  riskAmount: number;
  positionSize: number;
  roundedPositionSize: number;
  unitLabel: string;
  estimatedLoss: number;
  potentialProfit?: number;
  riskRewardRatio?: number;
  exceedsMaxRisk: boolean;
}> {
  return scenarios.map(pct => {
    const scenarioInput: CalculatorInput = {
      ...baseInput,
      riskPercent: pct,
      riskMode: 'percent'
    };

    const res = calculatePositionSize(scenarioInput, maxConfiguredRisk);
    return {
      percent: pct,
      riskAmount: Number((baseInput.accountBalance * (pct / 100)).toFixed(2)),
      positionSize: res.positionSize,
      roundedPositionSize: res.roundedPositionSize,
      unitLabel: res.unitLabel,
      estimatedLoss: res.estimatedLoss,
      potentialProfit: res.potentialProfit,
      riskRewardRatio: res.riskRewardRatio,
      exceedsMaxRisk: Boolean(maxConfiguredRisk && pct > maxConfiguredRisk)
    };
  });
}

function getDecimals(num: number): number {
  if (Math.floor(num) === num) return 0;
  const str = num.toString();
  return str.includes('.') ? str.split('.')[1].length : 0;
}
