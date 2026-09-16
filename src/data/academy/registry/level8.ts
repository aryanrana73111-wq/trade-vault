import { CurriculumConcept } from '@/types/academy';

export const LEVEL_8_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c8-options-payoff-geometry',
    title: 'Options Payoff Geometry & Put-Call Parity',
    category: 'DERIVATIVES',
    level: 8,
    difficulty: 'Intermediate',
    description: 'Deconstruct nonlinear derivative contracts: call rights, put obligations, intrinsic vs extrinsic value, and synthetic parity.',
    simpleExplanation: 'A Call option is a coupon that lets you buy a stock at a fixed price before an expiration date. A Put option lets you sell at a fixed price. Unlike buying a stock, options expire, and their profit graphs look like bent hockey sticks instead of straight lines.',
    professionalDefinition: 'Contingent financial claims granting the buyer the non-obligatory right (and seller the legal obligation) to transact an underlying asset at a specified strike price on or before maturity. Governed by Put-Call Parity: C + PV(K) = P + S.',
    prerequisites: ['c1-asset-classes', 'c1-long-vs-short'],
    relatedConcepts: ['c8-options-greeks', 'c8-implied-vs-historical-volatility'],
    formulas: [
      {
        name: 'Put-Call Parity',
        expression: 'C - P = S - K * e^(-r*T)',
        variables: [
          { symbol: 'C', meaning: 'Call price' },
          { symbol: 'P', meaning: 'Put price' },
          { symbol: 'S', meaning: 'Spot price of underlying' },
          { symbol: 'K', meaning: 'Strike price' },
          { symbol: 'r', meaning: 'Risk-free rate' },
          { symbol: 'T', meaning: 'Time to expiration in years' }
        ],
        notes: 'Enforces that synthetic long stock (Long Call + Short Put) must price identically to cash stock.'
      }
    ],
    examples: [
      {
        scenario: 'Trader buys a $100 strike Call option for $3.00 premium when stock is at $100.',
        analysis: 'At expiration, if stock is at $110, Call is worth $10 ($7 profit). If stock is at $95, Call expires worthless ($3 max loss).',
        outcome: 'The option buyer has defined capped downside (-$3) and unlimited linear upside above breakeven ($103).'
      }
    ],
    quizzes: [
      {
        id: 'q8-1',
        question: 'Under Put-Call Parity, what synthetic position is created by simultaneously buying a Call and selling a Put at the exact same strike and expiration?',
        options: [
          'A risk-free treasury bond',
          'A synthetic Long position in the underlying asset',
          'An iron condor',
          'A cash-secured put'
        ],
        correctIndex: 1,
        explanation: 'Long Call + Short Put produces the exact linear payoff of owning the underlying asset.'
      }
    ],
    commonMistakes: [
      'Buying out-of-the-money options expecting rapid price doubling without realizing time decay is eroding value every second.',
      'Treating options purely as lottery tickets rather than risk-transfer hedges.'
    ],
    learningObjectives: [
      'Diagram hockey-stick terminal payoff charts for basic and synthetic option spreads.',
      'Separate option premium into Intrinsic Value and Extrinsic (Time) Value.',
      'Apply Put-Call Parity to identify arbitrage and create synthetic structures.'
    ],
    estimatedLearningTime: 24
  },
  {
    id: 'c8-options-greeks',
    title: 'The Greeks: Delta, Gamma, Theta, Vega & Rho',
    category: 'DERIVATIVES',
    level: 8,
    difficulty: 'Advanced',
    description: 'Quantify option sensitivities: directional exposure (Delta), acceleration (Gamma), time bleed (Theta), and volatility exposure (Vega).',
    simpleExplanation: 'Delta is how much your option price moves when the stock moves $1. Gamma is how fast Delta changes. Theta is the daily rent you lose just for holding the option as days tick away. Vega is how much you make or lose when market fear goes up or down.',
    professionalDefinition: 'The partial derivatives of the Black-Scholes-Merton option pricing formula with respect to underlying spot price (Delta ∂V/∂S, Gamma ∂²V/∂S²), time decay (Theta ∂V/∂t), volatility (Vega ∂V/∂σ), and interest rates (Rho ∂V/∂r).',
    prerequisites: ['c8-options-payoff-geometry', 'c6-expected-value'],
    relatedConcepts: ['c8-implied-vs-historical-volatility', 'c8-volatility-smile-and-skew'],
    formulas: [
      {
        name: 'Black-Scholes Delta (Call)',
        expression: 'Δ = N(d1) ; where d1 = (ln(S/K) + (r + σ²/2)T) / (σ√T)',
        notes: 'Call Delta ranges from 0.0 to 1.0 (approximating risk-neutral exercise probability).'
      },
      {
        name: 'Gamma',
        expression: 'Γ = N\'(d1) / (S * σ * √T)',
        notes: 'Gamma peaks for at-the-money options near expiration, creating extreme convexity risk.'
      }
    ],
    examples: [
      {
        scenario: 'Trader holds 10 Long Call options with Delta 0.50 and Gamma 0.08. Underlying stock rallies by +$2.00.',
        analysis: 'Option price initially moves ~$1.00 per share from Delta. However, Gamma increases Delta from 0.50 to 0.66, accelerating subsequent gains.',
        outcome: 'Long Gamma provides positive convexity: winners grow faster and losers shrink slower.'
      }
    ],
    quizzes: [
      {
        id: 'q8-2',
        question: 'What Greek measures the rate of change of an option’s price relative to a 1% change in implied volatility?',
        options: [
          'Delta',
          'Theta',
          'Vega',
          'Gamma'
        ],
        correctIndex: 2,
        explanation: 'Vega measures dollar sensitivity of the option price per 1 percentage point change in implied volatility.'
      }
    ],
    commonMistakes: [
      'Buying weekly options right before earnings without realizing that Vega collapse (IV crush) will destroy the position even if the stock moves in the right direction.',
      'Underestimating short Gamma risk into expiration (the pin risk explosion).'
    ],
    learningObjectives: [
      'Calculate portfolio net Delta, Gamma, Theta, and Vega exposures.',
      'Deploy Delta-neutral hedging techniques using underlying shares.',
      'Manage the trade-off between positive Theta income and negative Gamma risk.'
    ],
    estimatedLearningTime: 28
  },
  {
    id: 'c8-implied-vs-historical-volatility',
    title: 'Implied vs Realized Volatility & The Volatility Risk Premium',
    category: 'DERIVATIVES',
    level: 8,
    difficulty: 'Advanced',
    description: 'The difference between what the market actually does (Realized Vol) and what options market prices forecast (Implied Vol).',
    simpleExplanation: 'Historical volatility is how much the stock actually moved in the past. Implied volatility is the fear priced into options about what might happen next week. Because people pay extra for insurance, Implied Volatility is usually higher than Realized Volatility. Selling that extra insurance is called harvesting the Volatility Risk Premium.',
    professionalDefinition: 'The structural divergence between forward-looking option-implied volatility (IV) and subsequent realized volatility of returns (RV). On average across equity indices, IV > RV, creating a persistent Volatility Risk Premium (VRP) analogous to insurance underwriting.',
    prerequisites: ['c6-z-score-standard-deviation', 'c8-options-greeks'],
    relatedConcepts: ['c8-volatility-smile-and-skew', 'c9-macro-liquidity-and-rates'],
    formulas: [
      {
        name: 'Volatility Risk Premium (VRP)',
        expression: 'VRP = IV - Realized_Vol',
        notes: 'A positive VRP provides the mathematical edge for short-volatility and option-selling strategies.'
      }
    ],
    examples: [
      {
        scenario: 'S&P 500 options trade at an Implied Volatility of 22% (VIX = 22). Over the next 30 days, the actual realized volatility of the index is only 14%.',
        analysis: 'Options buyers overpaid by 8 volatility points due to panic hedging.',
        outcome: 'Systematic volatility sellers capture the 8-point spread as net premium profit.'
      }
    ],
    quizzes: [
      {
        id: 'q8-3',
        question: 'Why does the Volatility Risk Premium (VRP) structurally exist in equity index options?',
        options: [
          'Because options exchanges require it by law',
          'Because portfolio managers and institutions are willing to pay an insurance premium above fair value to protect against catastrophic market crashes',
          'Because stock prices only ever rise',
          'Because options have zero carrying costs'
        ],
        correctIndex: 1,
        explanation: 'Institutional demand for downside portfolio insurance drives implied volatility persistently higher than realized volatility.'
      }
    ],
    commonMistakes: [
      'Blindly selling options to harvest VRP without tail-risk hedges, leading to catastrophic wipeout during Black Swan market crashes.',
      'Confusing high IV rank with a guaranteed signal to sell options.'
    ],
    learningObjectives: [
      'Calculate Realized Volatility from close-to-close log returns.',
      'Measure the Volatility Risk Premium (VRP) across different market regimes.',
      'Structure defined-risk option spreads that harvest premium while capping tail risk.'
    ],
    estimatedLearningTime: 26
  },
  {
    id: 'c8-volatility-smile-and-skew',
    title: 'The Volatility Surface: Skew, Smile & Term Structure',
    category: 'DERIVATIVES',
    level: 8,
    difficulty: 'Institutional',
    description: 'Explore why out-of-the-money puts trade at higher implied volatilities than calls: the post-1987 crash skew.',
    simpleExplanation: 'In textbook math, a 10% drop and a 10% jump should have the exact same implied volatility. But in real life, traders are terrified of market crashes! So downside put options are priced much higher than upside calls. This creates a tilted curve called the Volatility Skew.',
    professionalDefinition: 'The 3D manifold mapping implied volatility as a bivariate function of strike price (skew/smile) and time to expiration (term structure). In equity markets, asymmetric crash hedging demands create steep negative moneyness skew.',
    prerequisites: ['c8-options-greeks', 'c8-implied-vs-historical-volatility'],
    relatedConcepts: ['c6-probability-distributions', 'c10-multi-manager-allocations'],
    examples: [
      {
        scenario: 'SPY trades at $500. A 30-day $470 Put (6% OTM) trades at 24% IV, while a 30-day $530 Call (6% OTM) trades at only 13% IV.',
        analysis: 'The steep 11-point skew reflects heavy institutional demand for crash puts and supply of covered call overwriting.',
        outcome: 'Traders exploit skew discrepancies via risk reversals and ratio spreads.'
      }
    ],
    quizzes: [
      {
        id: 'q8-4',
        question: 'Why did the equity options "Volatility Skew" appear permanently after the Black Monday crash of October 1987?',
        options: [
          'Because computers were invented in 1988',
          'Because the market recognized that downside tail risks are far more severe and frequent than upside jumps, permanently bidding up out-of-the-money put premiums',
          'Because the government banned call options',
          'Because interest rates were lowered to zero'
        ],
        correctIndex: 1,
        explanation: 'The 1987 crash proved that asset prices can fall precipitously with fat tails, permanently embedding crash premium into downside put options.'
      }
    ],
    commonMistakes: [
      'Assuming Black-Scholes implied volatility is a flat constant across all strikes and maturities.',
      'Buying expensive downside puts when skew is already priced at historic highs.'
    ],
    learningObjectives: [
      'Read and analyze 3D volatility surfaces (skew and term structure).',
      'Construct skew-trading strategies (Risk Reversals, Broken Wing Butterflies).',
      'Identify contango vs backwardation in the VIX futures term structure.'
    ],
    estimatedLearningTime: 28
  },
  {
    id: 'c8-futures-basis-and-funding',
    title: 'Futures Basis, Contango, Backwardation & Perpetual Funding',
    category: 'MARKETS',
    level: 8,
    difficulty: 'Intermediate',
    description: 'How futures price relative to spot: cost of carry, convenience yield, roll yield, and crypto perpetual funding rates.',
    simpleExplanation: 'Futures are contracts to buy an asset in the future. If the future price is higher than today’s cash price, it is called Contango (you pay for storage and interest). If the future price is cheaper, it is Backwardation. In crypto, "funding rates" keep perpetual contracts tied to spot prices.',
    professionalDefinition: 'The relationship between cash spot and futures prices governed by the Cost of Carry model: F = S * e^((r + u - y)*T), where r is financing rate, u is storage cost, and y is convenience yield. Basis = Spot - Futures.',
    prerequisites: ['c1-asset-classes', 'c1-leverage-and-margin'],
    relatedConcepts: ['c9-macro-liquidity-and-rates', 'c10-prime-brokerage'],
    formulas: [
      {
        name: 'Cost of Carry Futures Pricing',
        expression: 'F_t = S_t * e^((r - q)*T)',
        variables: [
          { symbol: 'F_t', meaning: 'Fair futures price' },
          { symbol: 'S_t', meaning: 'Spot asset price' },
          { symbol: 'r', meaning: 'Risk-free financing interest rate' },
          { symbol: 'q', meaning: 'Dividend or dividend yield / convenience yield' },
          { symbol: 'T', meaning: 'Time to contract expiration' }
        ],
        notes: 'When dividend yield exceeds interest rates, futures trade at a discount (backwardation).'
      }
    ],
    examples: [
      {
        scenario: 'A crypto trader notices perpetual futures trading at a 0.05% funding fee every 8 hours (55% annualized) while spot trades at a discount.',
        analysis: 'Longs are heavily leveraged and paying massive funding payments to shorts.',
        outcome: 'Quantitative cash-and-carry desks buy spot and short perps, capturing a market-neutral 55% yield.'
      }
    ],
    quizzes: [
      {
        id: 'q8-5',
        question: 'What does "Contango" mean in commodity and futures markets?',
        options: [
          'Futures prices are lower than current spot prices',
          'Futures prices are higher than current spot prices, meaning investors rolling long positions suffer negative roll yield over time',
          'The contract has expired with zero value',
          'Trading has been halted by regulators'
        ],
        correctIndex: 1,
        explanation: 'In contango, the forward price curves upward above spot; rolling long contracts forward incurs negative roll drag.'
      }
    ],
    commonMistakes: [
      'Holding commodity or VIX exchange-traded products (ETFs) long-term without realizing that severe contango decays principal by 50-80% annually.',
      'Ignoring quarterly futures expiry roll dates.'
    ],
    learningObjectives: [
      'Calculate theoretical fair value of futures using the cost of carry model.',
      'Differentiate between Contango, Backwardation, and Roll Yield.',
      'Execute cash-and-carry basis arbitrage.'
    ],
    estimatedLearningTime: 24
  }
];
