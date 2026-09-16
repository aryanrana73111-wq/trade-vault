import { AcademyDomain, CurriculumCategory } from '@/types/academy';

export const ALL_CURRICULUM_CATEGORIES: CurriculumCategory[] = [
  'MARKETS',
  'TRADING FUNDAMENTALS',
  'TECHNICAL ANALYSIS',
  'FUNDAMENTAL ANALYSIS',
  'RISK MANAGEMENT',
  'EXECUTION',
  'PSYCHOLOGY',
  'BEHAVIORAL FINANCE',
  'QUANTITATIVE TRADING',
  'DERIVATIVES',
  'MACRO',
  'MARKET MICROSTRUCTURE',
  'PORTFOLIO MANAGEMENT',
  'SYSTEMATIC TRADING',
  'INSTITUTIONAL TRADING'
];

export const CATEGORY_METADATA: Record<CurriculumCategory, {
  label: string;
  description: string;
  domain: AcademyDomain;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  'MARKETS': {
    label: 'Markets',
    description: 'Financial exchange mechanisms, liquidity pools, asset classes, and price discovery.',
    domain: 'Market Knowledge',
    color: 'blue',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-900'
  },
  'TRADING FUNDAMENTALS': {
    label: 'Trading Fundamentals',
    description: 'Core concepts of speculation, hedging, order types, bid-ask dynamics, and margin.',
    domain: 'Market Knowledge',
    color: 'sky',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200 dark:border-sky-900'
  },
  'TECHNICAL ANALYSIS': {
    label: 'Technical Analysis',
    description: 'Market structure, liquidity sweeps, auction market theory, and quantitative chart analysis.',
    domain: 'Technical Analysis',
    color: 'violet',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-200 dark:border-violet-900'
  },
  'FUNDAMENTAL ANALYSIS': {
    label: 'Fundamental Analysis',
    description: 'Cash flow discounting, financial statements, valuation multiples, and business quality.',
    domain: 'Market Knowledge',
    color: 'teal',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeText: 'text-teal-700 dark:text-teal-300',
    badgeBorder: 'border-teal-200 dark:border-teal-900'
  },
  'RISK MANAGEMENT': {
    label: 'Risk Management',
    description: 'Fixed-fractional sizing, asymmetric drawdown mechanics, ruin probability, and stop discipline.',
    domain: 'Risk Management',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-900'
  },
  'EXECUTION': {
    label: 'Execution',
    description: 'Routing, transaction cost analysis (TCA), market vs limit orders, slippage, and dark pools.',
    domain: 'Execution',
    color: 'amber',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-900'
  },
  'PSYCHOLOGY': {
    label: 'Trading Psychology',
    description: 'Emotional neutrality, tilt mitigation, revenge trading inhibition, and probabilistic mindsets.',
    domain: 'Trading Psychology',
    color: 'rose',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-900'
  },
  'BEHAVIORAL FINANCE': {
    label: 'Behavioral Finance',
    description: 'Cognitive biases, disposition effect, loss aversion, overconfidence, and herd mentality.',
    domain: 'Trading Psychology',
    color: 'pink',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-200 dark:border-pink-900'
  },
  'QUANTITATIVE TRADING': {
    label: 'Quantitative Trading',
    description: 'Expected value, Monte Carlo simulation, statistical significance, fat tails, and Z-scores.',
    domain: 'Quantitative Analysis',
    color: 'cyan',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-900'
  },
  'DERIVATIVES': {
    label: 'Derivatives',
    description: 'Futures, options payoff geometry, Greeks (Delta, Gamma, Vega, Theta), and implied volatility.',
    domain: 'Market Knowledge',
    color: 'purple',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-900'
  },
  'MACRO': {
    label: 'Macro',
    description: 'Central bank liquidity, interest rate parity, bond yield curves, inflation, and FX flows.',
    domain: 'Market Knowledge',
    color: 'indigo',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-900'
  },
  'MARKET MICROSTRUCTURE': {
    label: 'Market Microstructure',
    description: 'Order book depth, limit order queues, iceberg orders, toxic flow, and matching engines.',
    domain: 'Execution',
    color: 'orange',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-200 dark:border-orange-900'
  },
  'PORTFOLIO MANAGEMENT': {
    label: 'Portfolio Management',
    description: 'Risk parity, covariance matrices, cross-asset correlation, Sharpe ratio, and rebalancing.',
    domain: 'Portfolio Management',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-900'
  },
  'SYSTEMATIC TRADING': {
    label: 'Systematic Trading',
    description: 'Algorithmic strategy rules, backtesting rigor, walk-forward testing, and overfitting prevention.',
    domain: 'Quantitative Analysis',
    color: 'blue',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-900'
  },
  'INSTITUTIONAL TRADING': {
    label: 'Institutional Trading',
    description: 'Prime brokerage, multi-manager pod structures, leverage constraints, and capital mandates.',
    domain: 'Professional Practice',
    color: 'slate',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    badgeBorder: 'border-slate-300 dark:border-slate-700'
  }
};
