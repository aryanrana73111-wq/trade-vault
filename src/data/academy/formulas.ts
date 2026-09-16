import { TradingFormula } from '@/types/academy';

export const TRADING_FORMULAS: TradingFormula[] = [
  {
    id: 'f-position-size',
    name: 'Fixed Fractional Position Sizing',
    domain: 'Risk Management',
    expression: 'Position Size = (Account Equity * (Risk % / 100)) / |Entry Price - Stop Price|',
    description: 'Calculates the exact number of asset units to trade so that hitting your technical stop-loss loses no more than your specified risk budget.',
    variables: [
      { symbol: 'equity', label: 'Account Equity ($)', defaultValue: 25000, unit: '$' },
      { symbol: 'riskPct', label: 'Risk Budget (%)', defaultValue: 1.0, unit: '%' },
      { symbol: 'entry', label: 'Entry Price ($)', defaultValue: 150.00, unit: '$' },
      { symbol: 'stop', label: 'Stop-Loss Price ($)', defaultValue: 145.00, unit: '$' }
    ],
    calculate: (inputs) => {
      const dollarRisk = inputs.equity * (inputs.riskPct / 100);
      const stopDistance = Math.abs(inputs.entry - inputs.stop);
      if (stopDistance === 0) return 0;
      return Math.floor(dollarRisk / stopDistance);
    },
    formatResult: (val) => `${val.toLocaleString()} units / shares`,
    interpretation: 'Always derive units from dollar risk and stop distance. Never pick arbitrary lot sizes.'
  },
  {
    id: 'f-expected-value',
    name: 'Strategy Expected Value (EV in R)',
    domain: 'Quantitative Analysis',
    expression: 'EV = (Win Rate * Avg Win R) - ((1 - Win Rate) * Avg Loss R)',
    description: 'Calculates the mathematical expectancy (average profit in R) per executed trade over a long sequence.',
    variables: [
      { symbol: 'winRate', label: 'Win Rate (%)', defaultValue: 45, unit: '%' },
      { symbol: 'avgWinR', label: 'Average Win (in R)', defaultValue: 2.5, unit: 'R' },
      { symbol: 'avgLossR', label: 'Average Loss (in R)', defaultValue: 1.0, unit: 'R' }
    ],
    calculate: (inputs) => {
      const pWin = inputs.winRate / 100;
      const pLoss = 1 - pWin;
      return (pWin * inputs.avgWinR) - (pLoss * inputs.avgLossR);
    },
    formatResult: (val) => `${val >= 0 ? '+' : ''}${val.toFixed(3)} R per trade`,
    interpretation: 'A positive EV (> +0.20R) indicates a durable statistical edge when combined with disciplined risk management.'
  },
  {
    id: 'f-drawdown-recovery',
    name: 'Asymmetric Drawdown Recovery Requirement',
    domain: 'Risk Management',
    expression: 'Required Gain % = (Drawdown % / (100 - Drawdown %)) * 100',
    description: 'Calculates the percentage return on remaining equity needed to recover back to your historical peak.',
    variables: [
      { symbol: 'ddPct', label: 'Drawdown Incurred (%)', defaultValue: 30, unit: '%' }
    ],
    calculate: (inputs) => {
      if (inputs.ddPct >= 100) return 999999;
      return (inputs.ddPct / (100 - inputs.ddPct)) * 100;
    },
    formatResult: (val) => `+${val.toFixed(1)}% required gain`,
    interpretation: 'Drawdown recovery is non-linear. Avoid deep drawdowns (>20%) because required recovery escalates exponentially.'
  },
  {
    id: 'f-sharpe-ratio',
    name: 'Sharpe Ratio (Risk-Adjusted Performance)',
    domain: 'Quantitative Analysis',
    expression: 'Sharpe = (Annualized Return - Risk Free Rate) / Annualized Volatility',
    description: 'Quantifies excess return generated per unit of total portfolio volatility.',
    variables: [
      { symbol: 'returnPct', label: 'Annualized Return (%)', defaultValue: 22, unit: '%' },
      { symbol: 'rfPct', label: 'Risk-Free Rate (%)', defaultValue: 4.5, unit: '%' },
      { symbol: 'volPct', label: 'Annualized Volatility (%)', defaultValue: 12, unit: '%' }
    ],
    calculate: (inputs) => {
      if (inputs.volPct === 0) return 0;
      return (inputs.returnPct - inputs.rfPct) / inputs.volPct;
    },
    formatResult: (val) => `${val.toFixed(2)}`,
    interpretation: 'Sharpe > 1.0 is acceptable; Sharpe > 1.5 is good; Sharpe > 2.0 is institutional quality.'
  },
  {
    id: 'f-profit-factor',
    name: 'Profit Factor',
    domain: 'Quantitative Analysis',
    expression: 'Profit Factor = Gross Profits ($) / Gross Losses ($)',
    description: 'The ratio of total dollar gains to total dollar losses across all closed trades in a sample.',
    variables: [
      { symbol: 'grossProfit', label: 'Gross Profits ($)', defaultValue: 34500, unit: '$' },
      { symbol: 'grossLoss', label: 'Gross Losses ($)', defaultValue: 19200, unit: '$' }
    ],
    calculate: (inputs) => {
      if (inputs.grossLoss === 0) return inputs.grossProfit > 0 ? 99 : 0;
      return inputs.grossProfit / inputs.grossLoss;
    },
    formatResult: (val) => `${val.toFixed(2)}`,
    interpretation: 'Profit Factor > 1.6 indicates a healthy, sustainable strategy buffer against regime shifts.'
  },
  {
    id: 'f-risk-of-ruin',
    name: 'Simplified Risk of Ruin Probability',
    domain: 'Risk Management',
    expression: 'RoR ≈ ((1 - Edge) / (1 + Edge)) ^ (Units of Capital)',
    description: 'Estimates the statistical probability of reaching complete account ruin given edge and capital units.',
    variables: [
      { symbol: 'winRate', label: 'Win Rate (%)', defaultValue: 50, unit: '%' },
      { symbol: 'riskPct', label: 'Risk Per Trade (%)', defaultValue: 2.0, unit: '%' }
    ],
    calculate: (inputs) => {
      const p = inputs.winRate / 100;
      const q = 1 - p;
      if (p <= 0.5 && inputs.riskPct >= 5) return 100;
      const edge = p - q;
      if (edge <= 0) return 100;
      const units = 100 / inputs.riskPct;
      const ratio = q / p;
      const ror = Math.pow(ratio, units) * 100;
      return Math.min(100, Math.max(0, ror));
    },
    formatResult: (val) => `${val.toFixed(2)}% chance of ruin`,
    interpretation: 'Keeping risk per trade at or below 1% drives the mathematical probability of ruin near 0%.'
  }
];
