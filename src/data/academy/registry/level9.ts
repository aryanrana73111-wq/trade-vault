import { CurriculumConcept } from '@/types/academy';

export const LEVEL_9_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c9-macro-liquidity-and-rates',
    title: 'Central Bank Liquidity, Rates & The Fed Balance Sheet',
    category: 'MACRO',
    level: 9,
    difficulty: 'Advanced',
    description: 'The ultimate tide lifting and lowering all market boats: Quantitative Easing (QE), Quantitative Tightening (QT), and Reverse Repo dynamics.',
    simpleExplanation: 'When central banks print money and lower interest rates to near zero, trillions of dollars flow into stocks, crypto, and real estate, making everything boom. When they hike interest rates and pull cash out of the system, asset prices fall like a drained swimming pool.',
    professionalDefinition: 'The transmission mechanism of monetary policy: how policy rate adjustments (Fed Funds), open market operations, central bank balance sheet expansion/contraction, and Treasury General Account (TGA) liquidity injections dictate risk asset valuations.',
    prerequisites: ['c0-what-is-money', 'c1-asset-classes'],
    relatedConcepts: ['c9-yield-curve-inversion', 'c9-credit-spreads-and-cycles'],
    formulas: [
      {
        name: 'Net Fed Liquidity Metric',
        expression: 'Net Liquidity = Fed Balance Sheet - Treasury General Account (TGA) - Reverse Repo Facility (RRP)',
        notes: 'Historically exhibits high correlation (+0.80+) with the S&P 500 and global risk asset cycles.'
      }
    ],
    examples: [
      {
        scenario: 'In March 2020, the Federal Reserve injected $3 trillion of liquidity and cut rates to 0% in response to the pandemic.',
        analysis: 'Despite devastating economic closures, global equity markets mounted the fastest recovery and bull market in history.',
        outcome: 'Global liquidity dominates micro-level corporate fundamentals in the medium term.'
      }
    ],
    quizzes: [
      {
        id: 'q9-1',
        question: 'What is the primary effect on financial asset prices when central banks aggressively pursue Quantitative Tightening (QT)?',
        options: [
          'Asset prices always double overnight',
          'Liquidity is drained from the commercial banking system, discount rates rise, and valuation multiples contract, exerting downward pressure on risk assets',
          'Trading volume reaches permanent all-time highs',
          'Currency exchange rates are abolished'
        ],
        correctIndex: 1,
        explanation: 'QT removes cash reserves from the financial system and increases the supply of debt securities, forcing risk premiums to expand and valuations to compress.'
      }
    ],
    commonMistakes: [
      'Fighting the Fed: taking heavily leveraged bullish bets during aggressive central bank rate hiking and QT regimes.',
      'Analyzing individual company earnings in a vacuum while ignoring massive macroeconomic liquidity contractions.'
    ],
    learningObjectives: [
      'Calculate the Net Fed Liquidity indicator using Federal Reserve H.4.1 releases.',
      'Trace monetary policy transmission through the interbank overnight market.',
      'Align trading portfolios with macro monetary expansion and contraction cycles.'
    ],
    estimatedLearningTime: 26
  },
  {
    id: 'c9-yield-curve-inversion',
    title: 'The Sovereign Yield Curve & Inversion Signals',
    category: 'MACRO',
    level: 9,
    difficulty: 'Advanced',
    description: 'Deconstruct the Treasury yield curve (2s10s, 3m10y): term premium, recession forecasting, and steepener trades.',
    simpleExplanation: 'Usually, lending money for 10 years pays higher interest than lending for 2 years because of the risk of time. An "inverted yield curve" happens when short-term interest rates become higher than long-term rates. Every time this happens, a recession has followed.',
    professionalDefinition: 'The graphical plot of bond yields across maturities. An inverted yield curve (where short-term yields exceed long-term yields, such as 10Y - 2Y < 0) signals impending economic recession, as investors anticipate future rate cuts and economic deceleration.',
    prerequisites: ['c1-asset-classes', 'c9-macro-liquidity-and-rates'],
    relatedConcepts: ['c9-credit-spreads-and-cycles', 'c9-fx-cross-asset-flows'],
    formulas: [
      {
        name: 'Yield Curve Slope (2s10s Spread)',
        expression: 'Spread_2s10s = Yield(10-Year Treasury) - Yield(2-Year Treasury)',
        notes: 'Negative spread values indicate inversion; the subsequent steepening back above zero historically coincides with economic recessions.'
      }
    ],
    examples: [
      {
        scenario: 'The 2-Year Treasury yield rises to 5.0% while the 10-Year yield sits at 3.8% (Spread: -120 bps inversion).',
        analysis: 'Short rates reflect tight immediate Fed policy, while long rates anticipate economic stagnation and future emergency rate cuts.',
        outcome: 'Banks reduce lending as net interest margins compress, triggering credit contraction.'
      }
    ],
    quizzes: [
      {
        id: 'q9-2',
        question: 'What historical economic event is an inverted 10-year / 2-year Treasury yield curve famous for predicting?',
        options: [
          'Immediate economic hypergrowth',
          'An impending economic recession within the following 12 to 24 months',
          'A permanent decline in government tax revenue to zero',
          'An immediate ban on bond trading'
        ],
        correctIndex: 1,
        explanation: 'Yield curve inversion has accurately preceded every US recession over the past 50 years.'
      }
    ],
    caseStudies: [
      {
        title: 'The 2006–2007 Yield Curve Inversion',
        era: '2006-2008',
        overview: 'The 2s10s spread inverted deeply in 2006. Many financial commentators claimed "this time is different" due to foreign central bank buying. By late 2007, the curve steepened violently as the Great Financial Crisis erupted.',
        keyTakeaway: 'The yield curve warning was mathematically correct despite early skepticism.'
      }
    ],
    commonMistakes: [
      'Assuming that the stock market will crash the exact day the curve inverts (recessions typically occur after the curve re-steepens, 12-18 months later).',
      'Ignoring the yield curve when structuring multi-month swing trades.'
    ],
    learningObjectives: [
      'Calculate and chart the 10Y-2Y and 10Y-3M sovereign yield curve spreads.',
      'Explain the difference between Bear Flattening, Bull Flattening, Bear Steepening, and Bull Steepening.',
      'Position equity and fixed income portfolios across yield curve regimes.'
    ],
    estimatedLearningTime: 25
  },
  {
    id: 'c9-fundamental-valuation',
    title: 'Discounted Cash Flow (DCF) & Valuation Multiples',
    category: 'FUNDAMENTAL ANALYSIS',
    level: 9,
    difficulty: 'Intermediate',
    description: 'Calculate intrinsic enterprise value: Free Cash Flow to Firm (FCFF), Weighted Average Cost of Capital (WACC), and terminal multiples.',
    simpleExplanation: 'A company is only worth the total cash it will produce over its entire lifetime, adjusted for the fact that a dollar 10 years from now is worth less than a dollar today. Valuation models calculate that exact fair value.',
    professionalDefinition: 'The absolute valuation methodology establishing the intrinsic enterprise value of a business by discounting its projected future Free Cash Flows (FCFF) at the firm’s Weighted Average Cost of Capital (WACC).',
    prerequisites: ['c0-trading-vs-investing'],
    relatedConcepts: ['c9-macro-liquidity-and-rates', 'c10-multi-manager-allocations'],
    formulas: [
      {
        name: 'Discounted Cash Flow Formula',
        expression: 'Enterprise Value = ∑ [ FCF_t / (1 + WACC)^t ] + [ Terminal Value / (1 + WACC)^n ]',
        variables: [
          { symbol: 'FCF_t', meaning: 'Free Cash Flow in year t' },
          { symbol: 'WACC', meaning: 'Weighted Average Cost of Capital' },
          { symbol: 'Terminal Value', meaning: 'FCF_n * (1 + g) / (WACC - g)' }
        ],
        notes: 'As interest rates rise, WACC increases, heavily penalizing high-growth, long-duration future cash flows.'
      }
    ],
    examples: [
      {
        scenario: 'Interest rates rise from 1% to 5%. A high-growth tech stock with zero current profits and cash flows expected in 10 years sees its discount rate surge.',
        analysis: 'The present value of distant cash flows drops by 60% due to the mathematical impact of higher denominator discount rates.',
        outcome: 'Long-duration growth stocks collapse while high-dividend, near-term cash flow companies outperform.'
      }
    ],
    quizzes: [
      {
        id: 'q9-3',
        question: 'Why do high-growth companies with projected earnings far into the future suffer severe valuation multiple compression when interest rates rise?',
        options: [
          'Because the law bans them from selling shares',
          'Because the higher discount rate (WACC) mathematically reduces the present value of cash flows that are far in the future',
          'Because computers run out of digits to calculate earnings',
          'Because consumers stop buying technology products'
        ],
        correctIndex: 1,
        explanation: 'In DCF models, the discount factor (1+r)^t compounds exponentially; distant cash flows lose the majority of their present value when r increases.'
      }
    ],
    commonMistakes: [
      'Relying solely on trailing P/E multiples without adjusting for cyclical peak earnings or debt leverage.',
      'Treating DCF valuations as exact prices rather than broad scenario sensitivity bands.'
    ],
    learningObjectives: [
      'Calculate Free Cash Flow to Firm (FCFF) from audited financial statements.',
      'Compute Weighted Average Cost of Capital (WACC) using CAPM.',
      'Perform scenario sensitivity analysis on terminal growth rates and discount rates.'
    ],
    estimatedLearningTime: 28
  },
  {
    id: 'c9-fx-cross-asset-flows',
    title: 'Global FX Flows, The Dollar Smile & Cross-Asset Linkages',
    category: 'MACRO',
    level: 9,
    difficulty: 'Advanced',
    description: 'How the US Dollar acts as the global reserve currency: Covered Interest Parity (CIP), carry trades, and the Dollar Smile theory.',
    simpleExplanation: 'The US Dollar is the world’s currency. When the US economy is booming, the dollar goes up. When global financial markets crash and panic ensues, the dollar ALSO goes up because everyone runs to safety! The dollar only drops when the rest of the world is growing smoothly. This is the "Dollar Smile."',
    professionalDefinition: 'The macro dynamics of foreign exchange markets dictated by the Dollar Smile framework (USD outperforming during US economic exceptionalism and global risk-off crises, while underperforming during synchronous global expansions) and Covered Interest Parity.',
    prerequisites: ['c1-asset-classes', 'c9-macro-liquidity-and-rates'],
    relatedConcepts: ['c9-yield-curve-inversion', 'c10-multi-manager-allocations'],
    examples: [
      {
        scenario: 'Global equities enter a liquidity crisis. Emerging market currencies, commodities, and risk assets drop sharply.',
        analysis: 'Worldwide non-US banks face severe US dollar funding shortages to service dollar-denominated debt.',
        outcome: 'The US Dollar Index (DXY) spikes higher, tightening global financial conditions further.'
      }
    ],
    quizzes: [
      {
        id: 'q9-4',
        question: 'Under the "Dollar Smile" theory, in which two distinct macroeconomic regimes does the US Dollar typically strengthen?',
        options: [
          'Only when US inflation reaches zero',
          '1) During severe global economic crises (safe-haven rush), and 2) During strong US economic outperformance relative to the rest of the world',
          'Only when gold prices reach record highs',
          'Whenever US companies pay quarterly dividends'
        ],
        correctIndex: 1,
        explanation: 'The Dollar Smile explains that USD rallies both in global panic (left side of smile) and robust US growth (right side of smile).'
      }
    ],
    commonMistakes: [
      'Assuming a falling dollar is always bad for US stock prices (a weaker dollar actually boosts multinational corporate earnings).',
      'Ignoring cross-currency basis swaps during international banking strains.'
    ],
    learningObjectives: [
      'Map the macroeconomic mechanics of the Dollar Smile curve.',
      'Analyze currency carry trade mechanics and unwinding risks (e.g. Yen carry trade).',
      'Integrate FX trends into equity and commodity positioning.'
    ],
    estimatedLearningTime: 24
  },
  {
    id: 'c9-credit-spreads-and-cycles',
    title: 'High Yield Credit Spreads & The Debt Cycle',
    category: 'PORTFOLIO MANAGEMENT',
    level: 9,
    difficulty: 'Advanced',
    description: 'Credit is the canary in the coal mine: High Yield (Junk) OAS spreads, investment grade spreads, and default cycles.',
    simpleExplanation: 'Bond investors are usually much smarter and more risk-averse than stock traders. When bond investors start demanding huge interest rates to lend money to risky companies (credit spreads widening), a major stock crash is usually right around the corner.',
    professionalDefinition: 'The Option-Adjusted Spread (OAS) between corporate bonds and risk-free Treasuries of equal maturity, quantifying market-implied credit risk, default probability, and debt refinancing viability.',
    prerequisites: ['c1-asset-classes', 'c9-macro-liquidity-and-rates'],
    relatedConcepts: ['c9-yield-curve-inversion', 'c10-risk-limits-and-mandates'],
    formulas: [
      {
        name: 'Credit Default Spread',
        expression: 'Credit Spread = Corporate Yield - Benchmark Treasury Yield',
        notes: 'High yield spreads expanding above 500-800 bps signals severe corporate distress and impending default waves.'
      }
    ],
    examples: [
      {
        scenario: 'Stocks hit new highs, but High Yield OAS spreads widen from 320 bps to 550 bps over a 3-week period.',
        analysis: 'Credit markets are signaling that lower-tier corporations cannot refinance maturing debt in the leveraged loan market.',
        outcome: 'Credit distress leaks into equities, triggering a broad stock market selloff weeks later.'
      }
    ],
    quizzes: [
      {
        id: 'q9-5',
        question: 'Why do institutional macro traders monitor high-yield (junk bond) credit spreads so closely?',
        options: [
          'Because junk bonds are legally guaranteed by the Treasury',
          'Because widening credit spreads reveal tightening financial conditions and rising corporate default risks before they appear on equity charts',
          'Because credit spreads never change',
          'To predict tomorrow’s consumer price index'
        ],
        correctIndex: 1,
        explanation: 'Credit markets typically lead equities because bondholders face asymmetric downside and rigorously police balance sheet solvency.'
      }
    ],
    commonMistakes: [
      'Ignoring widening credit spreads because stock index charts still look bullish.',
      'Failing to monitor corporate maturity wall refinancing schedules.'
    ],
    learningObjectives: [
      'Track High Yield OAS and Investment Grade spreads via FRED datasets.',
      'Recognize credit-equity divergences as early warning signals.',
      'Deconstruct Ray Dalio’s Short-Term and Long-Term Debt Cycles.'
    ],
    estimatedLearningTime: 25
  }
];
