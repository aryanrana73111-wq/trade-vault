import { AcademyDomain } from '@/types/academy';

export interface DiagnosticQuestion {
  id: string;
  domain: AcademyDomain;
  targetLevel: number; // 0 to 10
  type: 'multiple-choice' | 'numerical' | 'scenario' | 'execution';
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  skillEvaluated: string;
}

export const PLACEMENT_QUESTIONS: DiagnosticQuestion[] = [
  // 1. Market Basics (Level 0–1)
  {
    id: 'pt-1',
    domain: 'Market Knowledge',
    targetLevel: 0,
    type: 'multiple-choice',
    question: 'In an electronic continuous double auction, what is the "Bid-Ask Spread"?',
    options: [
      'The commission charged by the broker for opening an account',
      'The price difference between the highest price a buyer is willing to pay and the lowest price a seller is willing to accept',
      'The average daily trading volume of the exchange',
      'The overnight interest rate charged on margin balances'
    ],
    correctIndex: 1,
    explanation: 'The bid-ask spread is the instantaneous gap between the best available buy quote (bid) and best available sell quote (ask).',
    skillEvaluated: 'Order Book & Liquidity Mechanics'
  },
  {
    id: 'pt-2',
    domain: 'Market Knowledge',
    targetLevel: 1,
    type: 'numerical',
    question: 'You have a $10,000 account balance and use 20:1 leverage to open a $200,000 position. If the underlying asset drops by 3%, what percentage of your account equity is lost?',
    options: [
      '3% loss ($300)',
      '15% loss ($1,500)',
      '60% loss ($6,000)',
      '100% loss ($10,000)'
    ],
    correctIndex: 2,
    explanation: 'Loss = $200,000 * 0.03 = $6,000. $6,000 on a $10,000 capital base equals a 60% loss of equity!',
    skillEvaluated: 'Leverage Risk & Margin Calculation'
  },

  // 2. Execution (Level 2 & 6)
  {
    id: 'pt-3',
    domain: 'Execution',
    targetLevel: 2,
    type: 'execution',
    question: 'Why would an algorithmic execution desk choose a passive Limit order over an aggressive Market order?',
    options: [
      'Because market orders are illegal during regular market hours',
      'To capture price certainty and avoid crossing the bid-ask spread or suffering adverse slippage',
      'Because limit orders guarantee that your trade will always fill 100% of the time',
      'To increase broker commission fees'
    ],
    correctIndex: 1,
    explanation: 'Passive limit orders rest in the order book, ensuring you only transact at your chosen price or better, eliminating spread crossing cost at the expense of fill certainty.',
    skillEvaluated: 'Order Type Selection & Friction Management'
  },
  {
    id: 'pt-4',
    domain: 'Execution',
    targetLevel: 6,
    type: 'scenario',
    question: 'An institution needs to execute a $50M buy order in a stock with $100M average daily volume. If they place a single immediate market order, what microstructure effect will dominate?',
    options: [
      'The trade will fill at the previous day\'s closing price',
      'Massive adverse market impact and severe slippage as the order exhausts multiple price tiers in the limit order book',
      'The exchange will immediately split the stock 2-for-1',
      'The bid-ask spread will collapse to zero'
    ],
    correctIndex: 1,
    explanation: 'Submitting 50% of the average daily volume as a single market order causes severe implementation shortfall and market impact by wiping out all resting ask liquidity.',
    skillEvaluated: 'Market Microstructure & Implementation Shortfall'
  },

  // 3. Risk Management (Level 3)
  {
    id: 'pt-5',
    domain: 'Risk Management',
    targetLevel: 3,
    type: 'numerical',
    question: 'Account = $50,000. You enforce a strict 1% risk limit ($500). You want to buy Stock ABC at $100.00 with a technical stop-loss at $97.50 ($2.50 stop distance). What is your exact position size?',
    options: [
      '50 shares',
      '100 shares',
      '200 shares',
      '500 shares'
    ],
    correctIndex: 2,
    explanation: 'Position Size = Dollar Risk / Stop Distance = $500 / $2.50 = 200 shares. (200 * $2.50 = $500 max loss).',
    skillEvaluated: 'Fixed Fractional Position Sizing Math'
  },
  {
    id: 'pt-6',
    domain: 'Risk Management',
    targetLevel: 3,
    type: 'scenario',
    question: 'If your trading account suffers a 50% drawdown, what percentage return on remaining capital is required just to break even back to your starting balance?',
    options: [
      '50% gain',
      '75% gain',
      '100% gain',
      '200% gain'
    ],
    correctIndex: 2,
    explanation: 'If $100 drops to $50 (-50%), you must generate $50 of profit on a $50 base, which requires a +100% return.',
    skillEvaluated: 'Drawdown Asymmetry & Capital Preservation'
  },

  // 4. Technical Analysis & Market Structure (Level 4)
  {
    id: 'pt-7',
    domain: 'Technical Analysis',
    targetLevel: 4,
    type: 'multiple-choice',
    question: 'In structural price action, what defines an objective Change of Character (CHoCH) from an uptrend to a potential downtrend?',
    options: [
      'The 9-period moving average crosses below the 21-period moving average',
      'Price breaks decisively below the most recent Higher Low (HL) swing point',
      'The RSI indicator drops below 30',
      'Three consecutive red candles appear on a 1-minute chart'
    ],
    correctIndex: 1,
    explanation: 'An uptrend is structurally maintained by Higher Lows. When price violates the previous swing Higher Low, market structure shifts (CHoCH), invalidating bullish continuation.',
    skillEvaluated: 'Objective Market Structure & Swing Analysis'
  },

  // 5. Strategy Engineering (Level 5)
  {
    id: 'pt-8',
    domain: 'Quantitative Analysis',
    targetLevel: 5,
    type: 'numerical',
    question: 'Strategy X has a 40% win rate. Its average win is 2.5R, and its average loss is 1.0R. What is the Expected Value (EV) per trade?',
    options: [
      '-0.20R per trade',
      '+0.40R per trade',
      '+1.00R per trade',
      '+1.50R per trade'
    ],
    correctIndex: 1,
    explanation: 'EV = (0.40 * 2.5R) - (0.60 * 1.0R) = 1.0R - 0.60R = +0.40R per trade. A healthy, positive expectancy system.',
    skillEvaluated: 'Expected Value & Edge Validation'
  },

  // 6. Psychology & Behavioral Finance (Level 7)
  {
    id: 'pt-9',
    domain: 'Trading Psychology',
    targetLevel: 7,
    type: 'scenario',
    question: 'A trader quickly takes small profits of +0.3R on winners because of anxiety, but allows losing trades to run to -2.5R hoping they bounce. What behavioral bias is in effect?',
    options: [
      'Survivorship Bias',
      'The Disposition Effect (rooted in Loss Aversion)',
      'Look-Ahead Bias',
      'Hindsight Bias'
    ],
    correctIndex: 1,
    explanation: 'The Disposition Effect causes traders to realize gains prematurely to secure emotional pleasure, while refusing to cut losses to avoid emotional pain.',
    skillEvaluated: 'Behavioral Bias Diagnosis & Governance'
  },

  // 7. Quantitative & Statistics (Level 8)
  {
    id: 'pt-10',
    domain: 'Quantitative Analysis',
    targetLevel: 8,
    type: 'multiple-choice',
    question: 'Why do quantitative hedge funds use Monte Carlo simulations on historical trade logs?',
    options: [
      'To predict the exact price of an asset tomorrow at 2:00 PM',
      'To resample and reshuffle trade sequences thousands of times, revealing the full probability distribution of potential maximum drawdowns and streak risks',
      'To guarantee that a strategy will never experience a losing month',
      'To replace the need for backtesting entirely'
    ],
    correctIndex: 1,
    explanation: 'Monte Carlo simulations test the robustness of a strategy across randomized chronological sequences, exposing tail-risk drawdowns hidden in single backtest paths.',
    skillEvaluated: 'Stochastic Simulation & Tail Risk Modeling'
  },

  // 8. Portfolio Construction (Level 9)
  {
    id: 'pt-11',
    domain: 'Portfolio Management',
    targetLevel: 9,
    type: 'multiple-choice',
    question: 'What is the primary mathematical benefit of combining multiple trading strategies that have a 0.0 correlation coefficient?',
    options: [
      'It doubles the annual return automatically',
      'It drastically reduces portfolio return variance and drawdown depth without diminishing expected return',
      'It eliminates the need to pay broker commissions',
      'It guarantees a 100% win rate'
    ],
    correctIndex: 1,
    explanation: 'Ray Dalio\'s "Holy Grail": Combining uncorrelated positive-EV return streams slashes portfolio variance (risk) through covariance cancellation without reducing overall expected return.',
    skillEvaluated: 'Correlation & Multi-Asset Portfolio Optimization'
  },

  // 9. Institutional Research & Governance (Level 10)
  {
    id: 'pt-12',
    domain: 'Professional Practice',
    targetLevel: 10,
    type: 'scenario',
    question: 'In a hedge-fund-style research workflow, why must strategy rules and invalidations be frozen BEFORE conducting out-of-sample stress testing?',
    options: [
      'To comply with local municipal tax laws',
      'To prevent data snooping, overfitting, and survivorship bias from contaminating out-of-sample validation',
      'Because computer servers cannot modify code while running',
      'To prevent junior analysts from seeing the results'
    ],
    correctIndex: 1,
    explanation: 'Adjusting strategy rules after viewing out-of-sample data leaks future information into the model (data snooping), destroying the scientific validity of the test.',
    skillEvaluated: 'Institutional Research Methodology & Validation'
  }
];

export interface PlacementResult {
  assessedLevel: number;
  recommendedStartingLevel: number;
  domainScores: Record<AcademyDomain, number>;
  confidence: 'Preliminary' | 'Moderate' | 'High';
  strengths: AcademyDomain[];
  weaknesses: AcademyDomain[];
  recommendedLessonIds: string[];
}

export function evaluatePlacementTest(answers: Record<string, number>): PlacementResult {
  const domainTotals: Record<AcademyDomain, { total: number; correct: number }> = {
    'Market Knowledge': { total: 0, correct: 0 },
    'Technical Analysis': { total: 0, correct: 0 },
    'Fundamental Analysis': { total: 0, correct: 0 },
    'Risk Management': { total: 0, correct: 0 },
    'Execution': { total: 0, correct: 0 },
    'Trading Psychology': { total: 0, correct: 0 },
    'Behavioral Finance': { total: 0, correct: 0 },
    'Quantitative Analysis': { total: 0, correct: 0 },
    'Portfolio Management': { total: 0, correct: 0 },
    'Derivatives': { total: 0, correct: 0 },
    'Macro Economics': { total: 0, correct: 0 },
    'Market Microstructure': { total: 0, correct: 0 },
    'Research': { total: 0, correct: 0 },
    'Professional Practice': { total: 0, correct: 0 }
  };

  let totalQuestions = 0;
  let totalCorrect = 0;
  let maxLevelEarned = 0;

  PLACEMENT_QUESTIONS.forEach(q => {
    domainTotals[q.domain].total += 1;
    totalQuestions += 1;
    if (answers[q.id] === q.correctIndex) {
      domainTotals[q.domain].correct += 1;
      totalCorrect += 1;
      if (q.targetLevel > maxLevelEarned) {
        maxLevelEarned = q.targetLevel;
      }
    }
  });

  const domainScores: Record<AcademyDomain, number> = {
    'Market Knowledge': 0,
    'Technical Analysis': 0,
    'Fundamental Analysis': 0,
    'Risk Management': 0,
    'Execution': 0,
    'Trading Psychology': 0,
    'Behavioral Finance': 0,
    'Quantitative Analysis': 0,
    'Portfolio Management': 0,
    'Derivatives': 0,
    'Macro Economics': 0,
    'Market Microstructure': 0,
    'Research': 0,
    'Professional Practice': 0
  };

  const strengths: AcademyDomain[] = [];
  const weaknesses: AcademyDomain[] = [];

  (Object.keys(domainTotals) as AcademyDomain[]).forEach(domain => {
    const { total, correct } = domainTotals[domain];
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    domainScores[domain] = pct;
    if (pct >= 80) strengths.push(domain);
    else if (pct < 50) weaknesses.push(domain);
  });

  const overallAccuracy = (totalCorrect / totalQuestions) * 100;
  
  // Assessed Level: Conservative placement based on weakest link in foundational domains (Risk / Market / Execution)
  let assessedLevel = 0;
  if (overallAccuracy >= 90) assessedLevel = Math.min(maxLevelEarned, 9);
  else if (overallAccuracy >= 75) assessedLevel = Math.min(maxLevelEarned, 6);
  else if (overallAccuracy >= 60) assessedLevel = Math.min(maxLevelEarned, 4);
  else if (overallAccuracy >= 40) assessedLevel = Math.min(maxLevelEarned, 2);
  else assessedLevel = 0;

  // Never skip Risk Management if Risk score is below 70%
  let recommendedStartingLevel = assessedLevel;
  if (domainScores['Risk Management'] < 70 && recommendedStartingLevel > 3) {
    recommendedStartingLevel = 3; // Enforce Level 3 Risk & Survival as mandatory bedrock
  } else if (domainScores['Market Knowledge'] < 60) {
    recommendedStartingLevel = 0;
  }

  const recommendedLessonIds: string[] = [];
  if (domainScores['Risk Management'] < 80) {
    recommendedLessonIds.push('l3-position-sizing-mathematics', 'l3-expected-value-and-edge', 'l3-drawdown-and-risk-of-ruin');
  }
  if (domainScores['Technical Analysis'] < 80) {
    recommendedLessonIds.push('l4-market-structure-swings', 'l4-atr-and-volatility-stops');
  }
  if (domainScores['Execution'] < 80) {
    recommendedLessonIds.push('l2-order-types-execution', 'l6-market-microstructure-and-tca');
  }
  if (domainScores['Trading Psychology'] < 80) {
    recommendedLessonIds.push('l7-loss-aversion-and-disposition-effect');
  }
  if (domainScores['Quantitative Analysis'] < 80) {
    recommendedLessonIds.push('l8-probability-distributions-and-monte-carlo');
  }

  return {
    assessedLevel,
    recommendedStartingLevel,
    domainScores,
    confidence: totalQuestions >= 12 ? 'High' : 'Moderate',
    strengths,
    weaknesses,
    recommendedLessonIds: Array.from(new Set(recommendedLessonIds))
  };
}
