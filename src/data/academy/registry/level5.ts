import { CurriculumConcept } from '@/types/academy';

export const LEVEL_5_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c5-probabilistic-mindset',
    title: 'Probabilistic Thinking & The Law of Large Numbers',
    category: 'PSYCHOLOGY',
    level: 5,
    difficulty: 'Intermediate',
    description: 'Internalize that any single trade outcome is completely random, while a sequence of 100 trades is statistically predictable.',
    simpleExplanation: 'Think of a casino. The casino owner does not care if you win one hand of blackjack. They know that after 10,000 hands, the house edge guarantees they will make a profit. You must treat your trading exactly like the casino house, not the gambler.',
    professionalDefinition: 'The cognitive paradigm that decouples emotional attachment from individual Bernoulli trade trials, operating on the asymptotic convergence of sample mean to expected value via the Law of Large Numbers.',
    prerequisites: ['c3-r-multiples', 'c3-risk-of-ruin'],
    relatedConcepts: ['c5-outcome-bias', 'c6-expected-value'],
    examples: [
      {
        scenario: 'A disciplined trader follows their rules perfectly, enters an A+ setup, and gets stopped out for a -1R loss.',
        analysis: 'The amateur gets angry and changes their indicators. The professional accepts the loss with complete equanimity, knowing losses are simply cost of inventory in a probabilistic business.',
        outcome: 'The professional executes the next 20 trades flawlessly and captures the system’s mathematical edge.'
      }
    ],
    quizzes: [
      {
        id: 'q5-1',
        question: 'Why must a professional trader view their trades in large batches (e.g., 50–100 trades) rather than judging performance trade-by-trade?',
        options: [
          'Because taxes are only calculated once a year',
          'Because any single trade outcome is subject to random variance; true mathematical edge only manifests across a statistically meaningful sample of independent trials',
          'Because brokers require 100 trades minimum to withdraw funds',
          'Because chart patterns only work once a month'
        ],
        correctIndex: 1,
        explanation: 'In any probabilistic system, random distribution governs individual outcomes. True edge only emerges over the sample mean of large numbers.'
      }
    ],
    commonMistakes: [
      'Changing trading strategies or tweaking indicators after just 2 or 3 consecutive losing trades.',
      'Allowing an individual losing trade to impact emotional stability or self-worth.'
    ],
    learningObjectives: [
      'Embrace uncertainty on any single trade while maintaining certainty in long-term edge.',
      'Adopt the "Casino House" operational psychology.',
      'Track trading performance in rolling 50-trade sample blocks.'
    ],
    estimatedLearningTime: 20
  },
  {
    id: 'c5-loss-aversion-disposition',
    title: 'Loss Aversion & The Disposition Effect',
    category: 'BEHAVIORAL FINANCE',
    level: 5,
    difficulty: 'Intermediate',
    description: 'Prospect Theory in practice: why humans cut winners too early and hold losers too long, and how to reverse it.',
    simpleExplanation: 'Losing $100 hurts twice as much as winning $100 feels good. Because of this, traders desperately hold onto losing trades hoping they get back to even, but quickly close winning trades to lock in the tiny profit before it disappears.',
    professionalDefinition: 'Kahneman and Tversky’s Prospect Theory finding that investors are risk-averse over gains (prematurely selling winners) and risk-seeking over losses (holding deteriorating losers, hoping for breakeven), resulting in catastrophic negative payoff skew.',
    prerequisites: ['c3-asymmetric-drawdowns', 'c5-probabilistic-mindset'],
    relatedConcepts: ['c5-fom-and-revenge-trading', 'c5-cognitive-biases-trading'],
    formulas: [
      {
        name: 'Prospect Theory Value Function',
        expression: 'V(x) = x^α (for gains) ; V(x) = -λ * (-x)^β (for losses, where λ ≈ 2.25)',
        notes: 'Psychological loss aversion coefficient (λ) demonstrates that losses feel ~2.25x more painful than equivalent gains.'
      }
    ],
    examples: [
      {
        scenario: 'Trader buys a stock at $100. Stock A rises to $102; trader panics and sells to "lock in profit." Stock B falls to $95; trader refuses to sell, holding it all the way down to $60.',
        analysis: 'The trader took a tiny +$2 gain and a devastating -$40 loss, ensuring negative expectancy.',
        outcome: 'The disposition effect reverses institutional asymmetric payoffs.'
      }
    ],
    quizzes: [
      {
        id: 'q5-2',
        question: 'What is the "Disposition Effect" in behavioral trading?',
        options: [
          'The tendency to dispose of computer monitors during losses',
          'The psychological tendency to sell winning trades prematurely while holding onto losing trades indefinitely',
          'Always following your written trading plan',
          'Only trading during market opening hours'
        ],
        correctIndex: 1,
        explanation: 'The disposition effect describes the bias of cutting winners early to feel certainty, while holding losers to avoid acknowledging a loss.'
      }
    ],
    commonMistakes: [
      'Refusing to accept a small 1R loss because "it’s not a real loss until you sell."',
      'Closing winning runners at +0.3R because of anxiety that the market will take it back.'
    ],
    learningObjectives: [
      'Quantify the behavioral impact of Prospect Theory on trading expectancy.',
      'Systematically counter the disposition effect through automated stop and target orders.',
      'Develop the discipline to let winning positions reach structural targets.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c5-fom-and-revenge-trading',
    title: 'FOMO, Revenge Trading & Emotional Tilt',
    category: 'PSYCHOLOGY',
    level: 5,
    difficulty: 'Intermediate',
    description: 'The neurochemistry of emotional hijacking: Amygdala triggers, dopamine spikes, and systematic circuit breakers to prevent tilt.',
    simpleExplanation: 'FOMO is Fear Of Missing Out—chasing a stock that already shot up without you. Revenge trading is when you get angry after a loss, double your position size on a random trade to make the money back, and end up destroying your account.',
    professionalDefinition: 'Amygdala-driven emotional hijacking that suspends prefrontal cortex executive function, leading to compulsive risk escalation, rule violation, and catastrophic capital destruction following losses or missed market moves.',
    prerequisites: ['c3-risk-per-trade', 'c5-loss-aversion-disposition'],
    relatedConcepts: ['c5-outcome-bias', 'c10-risk-limits-and-mandates'],
    examples: [
      {
        scenario: 'Trader loses $1,000 on an open. Furious, they immediately enter a 5x larger trade on a random stock with no setup.',
        analysis: 'The prefrontal cortex is offline; the trader is in a state of high emotional tilt, seeking dopamine relief rather than trading edge.',
        outcome: 'The second trade loses $5,000, wiping out months of disciplined gains in 20 minutes.'
      }
    ],
    quizzes: [
      {
        id: 'q5-3',
        question: 'What is the most effective institutional protocol to prevent revenge trading?',
        options: [
          'Drinking energy drinks to focus harder',
          'Enforcing an automated daily loss limit (circuit breaker) that locks the trading platform after a specific drawdown threshold (e.g. -3R in a day)',
          'Immediately taking 5 more trades to make the money back',
          'Switching to a lower timeframe chart'
        ],
        correctIndex: 1,
        explanation: 'Hard operational circuit breakers remove human willpower from the equation when emotional tilt compromises rational decision-making.'
      }
    ],
    commonMistakes: [
      'Believing you can "fight through" tilt while continuing to trade with real capital.',
      'Chasing parabolic green candles after missing the initial entry.'
    ],
    learningObjectives: [
      'Recognize early somatic signals of emotional tilt (elevated heart rate, muscle tension, urgency).',
      'Establish personal Daily Max Loss (DML) circuit breakers.',
      'Implement mandatory cool-down periods following losing streaks.'
    ],
    estimatedLearningTime: 24
  },
  {
    id: 'c5-outcome-bias',
    title: 'Outcome Bias & Process-Oriented Execution',
    category: 'PSYCHOLOGY',
    level: 5,
    difficulty: 'Intermediate',
    description: 'Judge decisions by the quality of the process, never by whether the individual trade happened to make or lose money.',
    simpleExplanation: 'If you drive home drunk and don’t crash, that was still a terrible, stupid decision. If you take a high-probability trade according to your rules and lose 1R, that was a great decision! Separate process from outcome.',
    professionalDefinition: 'The cognitive error of evaluating the quality of a decision based solely on its eventual outcome rather than the decision-making process under uncertainty at the moment the choice was made.',
    prerequisites: ['c5-probabilistic-mindset'],
    relatedConcepts: ['c3-r-multiples', 'c7-trading-playbook'],
    examples: [
      {
        scenario: 'Trader breaks every rule, risks 50% of their account on earnings, and gets lucky with a 200% win.',
        analysis: 'Amateurs celebrate this as "great trading." Professionals recognize it as catastrophic behavior that reinforces fatal habits that will lead to total ruin on the next roll.',
        outcome: 'Good outcomes from bad processes are the most dangerous traps in trading.'
      }
    ],
    quizzes: [
      {
        id: 'q5-4',
        question: 'Which of the following represents an institutional definition of a "Good Trade"?',
        options: [
          'Any trade that makes money, regardless of how it was entered',
          'A trade that was planned according to verified edge, sized according to risk rules, and executed with discipline, regardless of whether it won or lost',
          'A trade that generates at least +10R in profit',
          'A trade that never experiences any drawdown'
        ],
        correctIndex: 1,
        explanation: 'In probabilistic environments, decision quality must be judged by adherence to edge and risk rules, not single-trade outcomes.'
      }
    ],
    commonMistakes: [
      'Scolding yourself for taking a valid stop-loss that was executed according to plan.',
      'Rewarding yourself for winning trades that were taken impulsively with no edge.'
    ],
    learningObjectives: [
      'Decouple decision evaluation from probabilistic trade outcomes.',
      'Score trades based on execution compliance rather than P&L.',
      'Build a process-based trading journal that grades rule adherence.'
    ],
    estimatedLearningTime: 18
  },
  {
    id: 'c5-cognitive-biases-trading',
    title: 'Cognitive Biases in Trading (Confirmation, Recency, Sunk Cost)',
    category: 'BEHAVIORAL FINANCE',
    level: 5,
    difficulty: 'Intermediate',
    description: 'Identify and neutralize the subconscious mental distortions that sabotage trading objectivity.',
    simpleExplanation: 'Confirmation bias is searching social media only for people who agree with your trade. Recency bias is thinking whatever happened yesterday will keep happening forever. Sunk cost bias is holding a terrible trade because you already spent time and money on it.',
    professionalDefinition: 'Systematic deviations from rational utility maximization, including confirmation bias, recency heuristic, sunk cost fallacy, and overconfidence bias, which distort market perception and risk assessment.',
    prerequisites: ['c5-loss-aversion-disposition'],
    relatedConcepts: ['c5-outcome-bias', 'c9-fundamental-valuation'],
    examples: [
      {
        scenario: 'Trader goes long and begins browsing trading forums, upvoting everyone who is bullish and blocking anyone who posts bearish charts.',
        analysis: 'Severe confirmation bias filters out critical contradictory risk data, leaving the trader blind to an impending structural breakdown.',
        outcome: 'The trader is caught completely unprepared when the market reverses.'
      }
    ],
    quizzes: [
      {
        id: 'q5-5',
        question: 'What is "Recency Bias" in market participants?',
        options: [
          'Only buying recently IPO’d stocks',
          'Overweighting recent market events and assuming recent trends or volatility will continue indefinitely into the future',
          'Using recent high-speed computers',
          'Only trading in the morning session'
        ],
        correctIndex: 1,
        explanation: 'Recency bias causes traders to extrapolate the immediate past (e.g. buying the top of a multi-week run or panic selling at the bottom).'
      }
    ],
    commonMistakes: [
      'Searching for social media validation after entering a trade.',
      'Adding to a losing position to "lower average price" (sunk cost trap).'
    ],
    learningObjectives: [
      'Identify Confirmation, Recency, Sunk Cost, and Anchoring biases in personal trading.',
      'Implement an anti-bias checklist before submitting orders.',
      'Actively seek out counter-theses to challenge every position.'
    ],
    estimatedLearningTime: 20
  }
];
