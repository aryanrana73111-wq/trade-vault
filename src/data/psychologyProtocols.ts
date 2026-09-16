export interface ActionProtocol {
  id: string;
  name: string;
  category: string;
  trigger: string;
  recognition: string[];
  pauseDuration: string;
  actionChecklist: string[];
  decisionRule: string;
  riskRule: string;
  postReviewInstructions: string[];
}

export const PSYCHOLOGY_PROTOCOLS: ActionProtocol[] = [
  {
    id: 'proto-fomo',
    name: 'FOMO Intervention Protocol',
    category: 'Impulse Management',
    trigger: 'Observing a rapid, violent price expansion in a market where you have zero existing position and feeling acute urgency to click Buy/Sell.',
    recognition: [
      'Heart rate spikes or physical restlessness while watching green/red candle expansions.',
      'Rationalizing: "If I wait for a pullback, I will miss the entire move."',
      'Checking social media feeds or message channels for real-time hype validation.'
    ],
    pauseDuration: 'Mandatory 10-Minute Stand-Down away from keyboard.',
    actionChecklist: [
      'Step away from monitors immediately for 10 full minutes.',
      'Measure the distance from current price to the 20-period moving average on the 1-Hour chart.',
      'Verify if current price is > 1.5x Average True Range (ATR) away from logical invalidation.',
      'Formulate a valid pullback limit order instead of executing a market order.'
    ],
    decisionRule: 'If price has already moved > 1.5x ATR from the initial strategy trigger point, THE TRADE IS DEAD. Acknowledge that chasing extended moves yields negative expectancy over 1,000 trials.',
    riskRule: 'Under NO circumstances execute a Market Order on a market that has expanded 3 consecutive bars on current timeframe.',
    postReviewInstructions: [
      'Document in TradeVault journal whether price subsequently retraced or continued.',
      'Calculate what the adverse excursion (drawdown) would have been had you chased the market order.'
    ]
  },
  {
    id: 'proto-revenge',
    name: 'Revenge Trading & Tilt Circuit Breaker',
    category: 'Emotional Dysregulation',
    trigger: 'Experiencing a frustrating, painful loss, bad fill, or stopped-out trade followed by an intense urge to immediately re-enter and "win the money back".',
    recognition: [
      'Surge of heat in the face or chest, clenching fists or jaw.',
      'Blaming external factors: "The broker hunted my stop" or "The market is manipulated".',
      'Desire to double contract size to recover the loss in one trade.'
    ],
    pauseDuration: 'Mandatory 30-Minute Terminal Lockout or complete shutdown for the remainder of the session.',
    actionChecklist: [
      'Close trading platform immediately (do not leave charts open).',
      'Perform 5 cycles of physiological sigh breathing (two deep inhales through nose, long exhale through mouth).',
      'Drink a glass of cold water and step outside or walk away from the desk.',
      'Review your lifetime trading statistics: remind yourself that one loss is mathematically insignificant in a sample of 500 trades.'
    ],
    decisionRule: 'If 2 consecutive losses have occurred in the same trading session, trading is TERMINATED for the day. No exceptions. Tomorrow is an entirely new statistical event.',
    riskRule: 'Never increase position size following a loss. If trading resumes after the mandatory pause, position size must be reduced by 50% of baseline risk.',
    postReviewInstructions: [
      'Log the emotional state and preceding trigger in TradeVault Psychology records.',
      'Verify whether the stopped-out trade adhered to strategy rules or was an impulsive mistake.'
    ]
  },
  {
    id: 'proto-stop-loss',
    name: 'Stop-Loss Discipline Protocol',
    category: 'Risk Preservation',
    trigger: 'Price approaching within 10% of your predetermined stop-loss level, generating an urge to widen, move, or cancel the stop order.',
    recognition: [
      'Thinking: "If I just give it a little more room, it will bounce."',
      'Hovering mouse cursor over the stop-loss order line to drag it further away.',
      'Feeling an overwhelming reluctance to realize the loss on paper.'
    ],
    pauseDuration: 'Hands off mouse immediately. Keep hands flat on desk.',
    actionChecklist: [
      'Remind yourself aloud: "My stop loss is my insurance policy that keeps me in this business."',
      'Recall that moving a stop loss converts a calculated risk into an uncalculated catastrophic risk.',
      'Accept that being wrong on a single trade has zero correlation with your intelligence or self-worth.'
    ],
    decisionRule: 'Stop losses may ONLY be moved in the direction of profit (trailing stops). Moving a stop loss further away from entry is a LEVEL 1 PROTOCOL VIOLATION and incurs a mandatory 24-hour trading suspension.',
    riskRule: 'The maximum allowable dollar loss on the trade is fixed at the moment of entry. It can never expand under any circumstances.',
    postReviewInstructions: [
      'If stopped out, accept it cleanly. Log the execution as a success in rule adherence regardless of financial outcome.',
      'Celebrate taking the disciplined loss as proof of professional institutional habits.'
    ]
  },
  {
    id: 'proto-overtrading',
    name: 'Overtrading & Boredom Quota Protocol',
    category: 'Execution Discipline',
    trigger: 'Having completed your planned daily trades or sitting in a quiet market session feeling restless, bored, and searching for action.',
    recognition: [
      'Flipping through 1-minute charts of exotic or unfamiliar currency pairs.',
      'Lowering your standards: "This is not my primary setup, but it looks like it might move."',
      'Viewing trading as entertainment or dopamine stimulation rather than business execution.'
    ],
    pauseDuration: 'Immediate session conclusion.',
    actionChecklist: [
      'Check current trade count against daily maximum quota (max 2-3 trades per day).',
      'Check current market time against high-liquidity session windows (avoid midday chop).',
      'Replace chart watching with productive non-market activity: exercise, backtesting, or study.'
    ],
    decisionRule: 'If your primary strategy conditions are not present, doing NOTHING is the only profitable position. Cash is an active, strategic position with zero drawdown.',
    riskRule: 'Maximum daily trade cap: after 3 executed trades, the trading day is officially closed.',
    postReviewInstructions: [
      'Record avoided junk trades in TradeVault as "Disciplined Inactions" to reinforce patience.'
    ]
  },
  {
    id: 'proto-overconfidence',
    name: 'Overconfidence Dampening Protocol',
    category: 'Risk Calibration',
    trigger: 'Achieving 4 or more consecutive winning trades, resulting in feelings of euphoria, invincibility, or genius.',
    recognition: [
      'Thinking: "I cannot lose; I have mastered this market completely."',
      'Considering taking 2x or 3x normal position size on the next trade.',
      'Skipping your standard pre-trade checklist because you feel "in the zone".'
    ],
    pauseDuration: 'Mandatory 1-Hour reflection period before entering another trade.',
    actionChecklist: [
      'Acknowledge the role of variance and favorable market regime in your winning streak.',
      'Review your historical worst drawdowns to re-anchor your risk perception.',
      'Verify that position size on the next setup is strictly identical to baseline risk.'
    ],
    decisionRule: 'Winning streaks NEVER warrant increasing fractional risk per trade. Standardize risk at 1.0% equity regardless of recent outcomes.',
    riskRule: 'Absolute ban on increasing position size during a winning streak. Size increases only occur when account equity formally achieves milestone thresholds.',
    postReviewInstructions: [
      'Document the winning streak as a favorable regime alignment, remaining humble and prepared for the inevitable statistical losing sequence.'
    ]
  }
];
