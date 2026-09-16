export interface ResearchFeedItem {
  id: string;
  title: string;
  source: string;
  author: string;
  date: string;
  category: 'Behavioral Finance' | 'Quantitative Execution' | 'Market Microstructure' | 'Risk Architecture';
  evidenceType: 'Peer-Reviewed Academic' | 'Empirical Prop Trading Study' | 'Institutional Whitepaper';
  summary: string;
  keyFindings: string[];
  relevantStrategies: string[];
  relevantPsychology: string[];
  limitations: string[];
}

export const BEHAVIORAL_RESEARCH_FEED: ResearchFeedItem[] = [
  {
    id: 'feed-01',
    title: 'Do Behavioral Biases Affect Prices? Evidence from CBOT Treasury Pit Traders',
    source: 'Journal of Finance, Vol. 60, No. 1',
    author: 'Joshua D. Coval & Tyler Shumway (University of Michigan)',
    date: '2005-02-01',
    category: 'Behavioral Finance',
    evidenceType: 'Peer-Reviewed Academic',
    summary: 'Analyzed proprietary transaction records of professional proprietary bond traders on the Chicago Board of Trade (CBOT). Found that professional full-time market makers exhibit severe loss aversion and risk escalation in the afternoon following morning losses.',
    keyFindings: [
      'Traders who suffered morning losses took significantly higher risk in the afternoon compared to morning winners.',
      'Losing afternoon traders assumed wider price risks, submitted larger orders, and produced negative expected afternoon returns.',
      'Direct empirical proof that even elite full-time professional traders are vulnerable to loss aversion and revenge trading if unconstrained by algorithmic circuit breakers.'
    ],
    relevantStrategies: ['Intraday Scalping', 'Futures Spread Trading'],
    relevantPsychology: ['Revenge Trading & Tilt', 'Loss Aversion & Disposition Effect', 'Risk Escalation'],
    limitations: [
      'Study evaluated open-outcry pit trading data; modern electronic algorithmic execution models introduce automated risk locks that pit environments lacked.'
    ]
  },
  {
    id: 'feed-02',
    title: 'The Psychophysiology of Real-Time Financial Risk Processing',
    source: 'Cognitive Brain Research, Vol. 14, Iss. 3',
    author: 'Andrew W. Lo & Dmitry V. Repin (MIT Sloan School of Management)',
    date: '2002-10-15',
    category: 'Behavioral Finance',
    evidenceType: 'Peer-Reviewed Academic',
    summary: 'Conducted live physiological monitoring (skin conductance, heart rate, respiration, body temperature) on professional FX and derivatives traders during real-time trading sessions under live market volatility.',
    keyFindings: [
      'Traders exhibited dramatic autonomic nervous system spikes during market events and periods of heightened volatility.',
      'Experienced senior traders exhibited faster emotional recovery and dampening of physiological stress markers compared to junior traders.',
      'Confirmed that emotional detachment and physiological self-regulation are trainable institutional skills directly correlated with long-term survival.'
    ],
    relevantStrategies: ['High Volatility Breakout', 'Intraday Execution'],
    relevantPsychology: ['FOMO', 'Tilt & Emotional Dysregulation', 'Overtrading'],
    limitations: [
      'Small experimental sample size (10 professional traders) due to laboratory sensor constraints during live trading hours.'
    ]
  },
  {
    id: 'feed-03',
    title: 'Trading is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors',
    source: 'Journal of Finance, Vol. 55, No. 2',
    author: 'Brad M. Barber & Terrance Odean (UC Davis)',
    date: '2000-04-01',
    category: 'Behavioral Finance',
    evidenceType: 'Peer-Reviewed Academic',
    summary: 'Analyzed 66,465 household brokerage trading accounts from 1991 to 1996 to evaluate the correlation between trade frequency and net portfolio performance.',
    keyFindings: [
      'The most active quintile of traders turned over their portfolios by 250% annually, earning net annual returns of 11.4% compared to the market benchmark of 17.9%.',
      'Transaction costs, bid-ask spread friction, and overconfident churning eroded over 6.5% in annual performance.',
      '"Trading is hazardous to your wealth" — excess activity without verified edge consistently destroys capital.'
    ],
    relevantStrategies: ['Long-Term Trend Following', 'Factor Investing'],
    relevantPsychology: ['Overtrading & Boredom Execution', 'Overconfidence & Hot-Hand Fallacy'],
    limitations: [
      'Evaluated retail equity investor accounts; does not evaluate systematic quantitative algorithmic trading funds with institutional fee structures.'
    ]
  },
  {
    id: 'feed-04',
    title: 'The Disposition to Sell Winners Too Early and Ride Losers Too Long: Theory and Evidence',
    source: 'Journal of Finance, Vol. 40, No. 3',
    author: 'Hersh Shefrin & Meir Statman (Santa Clara University)',
    date: '1985-07-01',
    category: 'Behavioral Finance',
    evidenceType: 'Peer-Reviewed Academic',
    summary: 'Seminal paper defining the "Disposition Effect": the systematic behavioral anomaly wherein traders realize gains rapidly while refusing to realize losses, driven by mental accounting and pride/regret seeking.',
    keyFindings: [
      'Investors systematically sell winning positions prematurely to capture the emotional pleasure of a confirmed win.',
      'Investors hold losing positions twice as long in an irrational psychological gamble to avoid crystallizing regret.',
      'Creates severely asymmetric negative return distributions in unconstrained trader accounts.'
    ],
    relevantStrategies: ['Trend Following', 'Breakout Strategies', 'Momentum'],
    relevantPsychology: ['Loss Aversion & Disposition Effect', 'Moving Stops', 'Holding Losers'],
    limitations: [
      'Focused primarily on individual retail accounts before the widespread adoption of automated bracket (OCO) order execution.'
    ]
  },
  {
    id: 'feed-05',
    title: 'Myopic Loss Aversion and the Equity Premium Puzzle',
    source: 'Quarterly Journal of Economics, Vol. 110, No. 1',
    author: 'Shlomo Benartzi & Richard H. Thaler (University of Chicago)',
    date: '1995-02-01',
    category: 'Risk Architecture',
    evidenceType: 'Peer-Reviewed Academic',
    summary: 'Discovered that the frequency with which an investor or trader evaluates their portfolio P&L directly dictates their risk aversion. High evaluation frequency makes positive-expectancy strategies feel unendurably painful.',
    keyFindings: [
      'Traders checking tick-by-tick or 1-minute P&L experience losses nearly 50% of the time due to market noise.',
      'Because losses hurt 2x more than gains, frequent monitoring produces acute mental exhaustion and irrational premature trade closure.',
      'Lengthening the evaluation horizon dramatically increases adherence to positive-expectancy strategies.'
    ],
    relevantStrategies: ['Multi-Asset Time-Series Momentum', 'Defensive Allocation'],
    relevantPsychology: ['Loss Aversion', 'Impatience', 'Overtrading'],
    limitations: [
      'Applies predominantly to holding periods; intraday market makers must monitor real-time order books for inventory risk management.'
    ]
  }
];
