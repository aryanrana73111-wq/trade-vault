export interface PsychologyConcept {
  id: string;
  name: string;
  category: 'Cognitive Bias' | 'Emotional State' | 'Execution Trap' | 'Risk Distortion';
  definition: string;
  whyItHappens: string;
  tradingManifestation: string;
  example: string;
  counterexample: string;
  warningSigns: string[];
  typicalBehavior: string;
  riskConsequences: string[];
  performanceConsequences: string[];
  detectionMethod: string;
  prevention: string[];
  intervention: string[];
  protocolName: string;
  exercises: string[];
  checklist: string[];
  reflectionQuestions: string[];
  relatedBiases: string[];
  relatedStrategies: string[];
  researchSources: string[];
}

export const PSYCHOLOGY_LIBRARY: PsychologyConcept[] = [
  {
    id: 'bias-fomo',
    name: 'FOMO (Fear of Missing Out)',
    category: 'Emotional State',
    definition: 'An acute, anxiety-driven compulsion to enter a market position motivated by the perception that others are capturing profits from an existing rapid price advance.',
    whyItHappens: 'Evolutionary social comparison instincts and scarcity heuristics hardwire humans to avoid feeling excluded from communal resource acquisition. The brain processes missed opportunity similarly to physical loss.',
    tradingManifestation: 'Entering market orders at the tail-end of parabolic expansions without an established setup, favorable risk-reward ratio, or logical invalidation level.',
    example: 'Bitcoin surges $4,000 in 20 minutes; a trader watching social media buys the exact top tick without checking the 4-hour resistance zone or establishing a stop-loss.',
    counterexample: 'A trader notes a massive price surge in Gold, recognizes that price has extended beyond the 20-period ATR band, and calmly logs the market for a potential pullback retest setup tomorrow.',
    warningSigns: [
      'Heart rate acceleration while watching fast green/red candlesticks.',
      'Rationalizing an entry with "it is moving too fast to wait for a candle close".',
      'Checking social media feeds or group chats for trade validation.',
      'Entering a trade without calculating position size or dollar risk first.'
    ],
    typicalBehavior: 'Chasing extended candles, clicking market buy orders at resistance, abandoning established trading rules.',
    riskConsequences: [
      'Entering at the worst possible statistical location (peak exhaustion).',
      'Requires excessively wide stop losses that distort portfolio risk parameters.'
    ],
    performanceConsequences: [
      'Depressed win rates on chasing entries (<35%).',
      'Severe negative average R multiples resulting from rapid mean-reversion wicks.'
    ],
    detectionMethod: 'Review journal entries for trades where Entry Price was > 2.0x ATR away from the 20-period EMA at the time of execution.',
    prevention: [
      'Implement an immutable "No Market Orders" policy on breakouts; require limit orders.',
      'Enforce an ATR distance ceiling: if price is > 1.5x ATR from the setup trigger, the trade is dead.'
    ],
    intervention: [
      'Step away from monitors immediately for 15 minutes upon noticing physical urgency.',
      'Execute the FOMO Protocol: recite the statistical reality of mean reversion.'
    ],
    protocolName: 'FOMO Intervention Protocol',
    exercises: [
      'Spend 1 week intentionally letting 3 strong breakouts go without entering, documenting the subsequent retracements in a journal to desensitize the fear of missing out.'
    ],
    checklist: [
      'Does this trade satisfy 100% of my pre-written strategy entry criteria?',
      'Is price within acceptable ATR distance from the structural invalidation level?',
      'Am I entering because of a proven edge or because price is moving rapidly?'
    ],
    reflectionQuestions: [
      'What specifically am I afraid of missing? Does one missed move threaten my multi-year career?',
      'How many times has chasing an extended candle resulted in buying the exact local top?'
    ],
    relatedBiases: ['Herding', 'Regret Aversion', 'Recency Bias'],
    relatedStrategies: ['Breakout Strategies', 'Momentum Strategies'],
    researchSources: ['Kahneman & Tversky (1979) Prospect Theory', 'Lo & Repin (2002) Emotional Reactivity in Market Participants']
  },
  {
    id: 'bias-revenge',
    name: 'Revenge Trading & Tilt',
    category: 'Emotional State',
    definition: 'An aggressive, emotionally dysregulated state triggered by a painful loss or series of losses, leading a trader to immediately re-enter the market with elevated size to "win back" lost capital.',
    whyItHappens: 'Ego threat and acute loss aversion. The amygdala activates an acute fight-or-flight stress response, overriding prefrontal cortex rational risk faculties to eradicate the emotional wound of being "wrong".',
    tradingManifestation: 'Doubling position size immediately after a stop-out, entering in the opposite direction without a setup, or trading outside scheduled market sessions.',
    example: 'After being stopped out on EUR/USD for a -$500 loss, a trader furiously enters a 3.0 lot position in the opposite direction within 45 seconds to claw back the money.',
    counterexample: 'A trader experiences a stopped-out loss on GBP/USD, accepts the -$250 loss as the statistical cost of doing business, logs the trade outcome in TradeVault, and steps away for lunch.',
    warningSigns: [
      'Feeling a surge of anger, heat in the face, or elevated pulse following a loss.',
      'Muttering "the market is rigged" or "I am getting my money back right now".',
      'Increasing contract size without a change in account equity.',
      'Trading rapidly within 2 minutes of a stopped-out trade.'
    ],
    typicalBehavior: 'Rapid-fire order execution, sizing escalation, violating daily loss limits.',
    riskConsequences: [
      'Account blowups: losing 10% to 50% of account equity in a single afternoon.',
      'Total loss of capital discipline and violation of prop firm maximum daily drawdown limits.'
    ],
    performanceConsequences: [
      'Catastrophic negative skew: single revenge trading days wiping out 3 months of disciplined gains.'
    ],
    detectionMethod: 'Audit journal for trades executed within 5 minutes of a previous loss where position size was greater than the previous trade.',
    prevention: [
      'Set an immutable Daily Max Loss limit (e.g. 2.0% equity or 2 consecutive losses).',
      'Use platform lockouts or automated risk locks that disable trading after 2 losses.'
    ],
    intervention: [
      'Activate the Revenge Trading Protocol: close trading terminal, lock computer, perform 5 minutes of physiological sigh breathing.'
    ],
    protocolName: 'Revenge Trading Circuit Breaker',
    exercises: [
      'Conduct a 30-day "Single Trade Daily Cap" exercise to rebuild prefrontal executive control.'
    ],
    checklist: [
      'Has at least 30 minutes elapsed since my previous trade outcome was resolved?',
      'Am I executing this trade with standard baseline position sizing?',
      'Is my emotional state calm, detached, and objective?'
    ],
    reflectionQuestions: [
      'Can the market "owe" me anything? Does the market even know I exist?',
      'Will forcing another trade heal my ego or compound my financial and psychological drawdown?'
    ],
    relatedBiases: ['Loss Aversion', 'Sunk Cost Fallacy', 'Illusion of Control'],
    relatedStrategies: ['All Strategies (Universal Threat)'],
    researchSources: ['Steenbarger (2006) Enhancing Trader Performance', 'Douglas (2000) Trading in the Zone']
  },
  {
    id: 'bias-loss-aversion',
    name: 'Loss Aversion & Disposition Effect',
    category: 'Cognitive Bias',
    definition: 'The behavioral tendency to feel the psychological pain of a financial loss approximately twice as intensely as the pleasure of an equivalent gain, causing traders to cut winning trades prematurely while holding losing trades in hope of breakeven.',
    whyItHappens: 'Rooted in Prospect Theory. Humans are risk-averse when evaluating gains (locking in small sure profits) but become risk-seeking when evaluating losses (gambling that a loser will bounce back).',
    tradingManifestation: 'Closing a winning trade at +0.5R to secure a "green trade" while moving stop losses further away or removing stops entirely on losing trades.',
    example: 'A trader buys a stock with a 2.0R target ($10 gain) and 1.0R stop ($5 loss). As soon as price reaches +$2 gain, the trader panic-sells to bank profit. Next trade drops -$5, so the trader moves the stop to -$15 hoping it will rebound.',
    counterexample: 'A trader lets winning trades hit predefined take-profit targets or trails stops systematically according to rule, while allowing stopped-out trades to exit mechanically without interference.',
    warningSigns: [
      'Moving stop losses further away as price approaches them.',
      'Checking floating unrealized P&L every 10 seconds while a trade is open.',
      'Closing a trade early "just to take some profit off the table" without technical justification.'
    ],
    typicalBehavior: 'Asymmetric trade management: cutting winners early, letting losers run.',
    riskConsequences: [
      'A catastrophic single loser wiping out the gains of 8 previous winning trades.',
      'Destroying system mathematical expectancy.'
    ],
    performanceConsequences: [
      'Average Loss significantly exceeds Average Win (e.g. Avg Loss = -1.8R while Avg Win = +0.6R).'
    ],
    detectionMethod: 'Compare Average Win in R against Average Loss in R inside TradeVault Analytics.',
    prevention: [
      'Use automated "Set and Forget" bracket orders (OCO: One-Cancels-the-Other) and minimize screen time.',
      'Hide floating unrealized dollar P&L on the execution platform; view charts in points/ticks only.'
    ],
    intervention: [
      'If caught considering moving a stop loss, enforce the Stop-Loss Discipline Protocol: accept the exit immediately.'
    ],
    protocolName: 'Stop-Loss Discipline Protocol',
    exercises: [
      'Log 20 consecutive trades where stop losses and profit targets are strictly untouched post-entry.'
    ],
    checklist: [
      'Is my planned target at least 1.5x greater than my planned stop distance?',
      'Have I committed in writing to never move my stop loss further from entry under any circumstances?'
    ],
    reflectionQuestions: [
      'Why am I afraid of a stop-loss when it is the very tool that preserves my career capital?',
      'How does cutting my winners early prevent my edge from expressing itself mathematically?'
    ],
    relatedBiases: ['Sunk Cost Fallacy', 'Disposition Effect', 'Regret Aversion'],
    relatedStrategies: ['Trend Following', 'Breakout Strategies'],
    researchSources: ['Kahneman & Tversky (1979)', 'Shefrin & Statman (1985) The Disposition to Sell Winners Too Early and Ride Losers Too Long']
  },
  {
    id: 'bias-overconfidence',
    name: 'Overconfidence & Hot-Hand Fallacy',
    category: 'Cognitive Bias',
    definition: 'An inflated belief in one\'s own predictive ability following a winning streak, leading to the assumption that recent success was caused entirely by superior intellect rather than favorable market regime or variance.',
    whyItHappens: 'Self-serving attribution bias: humans attribute positive outcomes to internal skill and negative outcomes to external bad luck.',
    tradingManifestation: 'Increasing position size significantly after 4 consecutive wins, ignoring trade checklists, and taking sub-par setups under the illusion that "I have the market wired".',
    example: 'After 5 consecutive winning trades on Gold, a trader feels invincible and takes a 4x standard size position on a casual hunch without doing pre-market preparation.',
    counterexample: 'After a 6-trade winning streak, a trader acknowledges that market conditions were exceptionally favorable to trend following, maintains standard 1.0% risk sizing, and heightens vigilance.',
    warningSigns: [
      'Thinking "I cannot lose on this trade".',
      'Skipping pre-trade checklists because "I already know what will happen".',
      'Believing you have discovered a secret market cheat code that eliminates losses.'
    ],
    typicalBehavior: 'Risk escalation, sloppy execution, taking trades outside strategy rules.',
    riskConsequences: [
      'The largest position size in a trader\'s history is taken on the trade most likely to fail (mean reversion of variance).'
    ],
    performanceConsequences: [
      'Violent drawdown immediately following peak equity highs.'
    ],
    detectionMethod: 'Monitor position size variance in TradeVault. Check if trade risk percent spikes after 3+ consecutive wins.',
    prevention: [
      'Enforce fixed fractional risk rules tied to portfolio equity, preventing manual risk escalation.'
    ],
    intervention: [
      'Review historical drawdowns and remind oneself of market humility and regime dependency.'
    ],
    protocolName: 'Overconfidence Dampening Protocol',
    exercises: [
      'Write down all alternative explanations (luck, macro liquidity tailwind) for your recent winning streak.'
    ],
    checklist: [
      'Am I taking this trade because it fulfills all rules or because I feel lucky?',
      'Is the position size strictly identical to my standard baseline risk?'
    ],
    reflectionQuestions: [
      'Did my skill increase by 300% this week, or did the market regime simply align with my strategy?',
      'Am I prepared to give back my entire streak by over-leveraging on a single trade?'
    ],
    relatedBiases: ['Illusion of Control', 'Self-Serving Bias', 'Outcome Bias'],
    relatedStrategies: ['All Strategies'],
    researchSources: ['Barber & Odean (2001) Boys Will Be Boys: Gender, Overconfidence, and Common Stock Investment']
  },
  {
    id: 'bias-overtrading',
    name: 'Overtrading & Boredom Execution',
    category: 'Execution Trap',
    definition: 'Executing an excessive volume of trades beyond strategy parameters, driven by the desire for stimulation, dopamine, or the misguided belief that more trades equal more profit.',
    whyItHappens: 'Dopamine seeking and action bias. Modern digital interfaces mimic gaming environments. Traders equate inactivity with laziness, failing to understand that trading edge requires waiting for asymmetric conditions.',
    tradingManifestation: 'Trading low-timeframe noise during lunch hours or flat Asian sessions when no clear setups exist.',
    example: 'Having executed his morning plan by 10:30 AM, a trader gets bored sitting in front of screens and takes 7 random scalping trades on 1-minute charts during the midday lull, losing $800 in spread and commissions.',
    counterexample: 'A trader sees no qualifying setups meeting criteria during the morning session, calmly closes the terminal, and spends the afternoon reading quantitative research.',
    warningSigns: [
      'Staring at 1-minute charts searching for any reason to enter.',
      'Entering positions on unfamiliar currency pairs or obscure crypto tokens out of boredom.',
      'Executing more than 3x standard daily trade count.'
    ],
    typicalBehavior: 'Excessive turnover, trading during low-liquidity hours, churning account in commissions.',
    riskConsequences: [
      'Transaction cost drag: commissions and spread eating 40%+ of gross returns.',
      'Mental exhaustion and decision fatigue leading to severe execution errors.'
    ],
    performanceConsequences: [
      'Substantially degraded profit factor due to high volume of scratch or losing low-quality trades.'
    ],
    detectionMethod: 'Analyze TradeVault Trade Frequency by Hour and Session. Check win rate of trades entered between 11:30 AM and 1:30 PM EST.',
    prevention: [
      'Implement a strict daily maximum trade quota (e.g. max 2 trades per session).',
      'Define explicit operational trading windows (e.g. only 08:00-11:00 UTC and 13:30-16:00 UTC).'
    ],
    intervention: [
      'Enforce the Overtrading Circuit Breaker: close trading platform immediately after daily quota is reached.'
    ],
    protocolName: 'Overtrading Circuit Breaker',
    exercises: [
      'Spend 3 full trading sessions in "Observation Only" mode: log setups on paper without taking live orders.'
    ],
    checklist: [
      'Is this trade occurring within my authorized operational session hours?',
      'Have I exceeded my maximum daily trade count limit?'
    ],
    reflectionQuestions: [
      'Am I trading for financial growth or trading for dopamine stimulation and entertainment?',
      'Do professional institutional asset managers click buttons every 3 minutes?'
    ],
    relatedBiases: ['Action Bias', 'Sensation Seeking', 'Impatience'],
    relatedStrategies: ['Scalping', 'Intraday Strategies'],
    researchSources: ['Odean (1999) Do Investors Trade Too Much?', 'Frey et al. (2014) Neuroeconomics of Sensation Seeking']
  }
];
