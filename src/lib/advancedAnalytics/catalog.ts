import { FeatureCatalogItem } from './types';
import { Trade } from '@/types';

export const LAB_CATEGORIES = [
  { id: 'all', label: 'All Analytics', icon: 'Sparkles', count: 65 },
  { id: 'statistical', label: 'Statistical Edge', icon: 'Scale', count: 8 },
  { id: 'distribution', label: 'Distribution Analysis', icon: 'BarChart2', count: 10 },
  { id: 'stability', label: 'Performance Stability & Sequences', icon: 'Activity', count: 8 },
  { id: 'risk-drawdown', label: 'Risk-Adjusted & Drawdowns', icon: 'ShieldAlert', count: 9 },
  { id: 'efficiency', label: 'Capital & Sizing Efficiency', icon: 'Zap', count: 5 },
  { id: 'execution', label: 'Execution & Cost Friction', icon: 'DollarSign', count: 5 },
  { id: 'entry-exit', label: 'Entry & Exit Timing', icon: 'Crosshair', count: 6 },
  { id: 'time', label: 'Time & Seasonality', icon: 'Calendar', count: 5 },
  { id: 'strategy-portfolio', label: 'Strategy & Portfolio Interaction', icon: 'Layers', count: 7 },
  { id: 'robustness', label: 'Sensitivity & Robustness Testing', icon: 'FlaskConical', count: 8 },
  { id: 'research', label: 'Research Tools & Custom Builders', icon: 'Compass', count: 6 },
  { id: 'data-quality', label: 'Data Quality & Reliability', icon: 'CheckCircle2', count: 3 }
] as const;

export const FEATURE_CATALOG: FeatureCatalogItem[] = [
  // A. STATISTICAL EDGE
  {
    id: 'expectancy-decomposition',
    title: 'Expectancy Decomposition',
    shortDescription: 'Deconstruct observed mathematical expectancy into win rate, loss rate, payoff ratio, and frequency.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'How much of my edge comes from win rate versus payoff ratio?',
    requiredFields: ['pnl', 'result', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 30,
    iconName: 'Scale',
    explainer: {
      title: 'Expectancy Decomposition',
      category: 'Statistical Edge',
      questionAnswered: 'What exact components generate my observed statistical return per trade?',
      whatIsIt: 'Expectancy decomposition breaks down your net trade expectation into its fundamental mathematical building blocks: Win Rate (P_w), Loss Rate (P_l), Average Win, and Average Loss.',
      whyItMatters: 'Traders often mistake a high win rate for a strong edge. By decomposing expectancy, you see whether your profitability is powered by high accuracy, asymmetric reward-to-risk, or trade frequency.',
      formula: 'Expectancy ($) = (WinRate × AvgWin) - (LossRate × AvgLoss)',
      variables: [
        { name: 'WinRate', description: 'Percentage of closed trades with positive return' },
        { name: 'AvgWin', description: 'Average dollar or R profit on winning trades' },
        { name: 'LossRate', description: 'Percentage of closed trades with negative return' },
        { name: 'AvgLoss', description: 'Average dollar or R loss on losing trades' }
      ],
      interpretation: 'A positive expectancy means every trade executed has a positive mathematical value over a large sample.',
      limitations: 'Calculated purely on historical observations; does not account for regime shifts or liquidity shocks.',
      sampleSizeCaution: 'Requires at least 30 closed trades for basic statistical relevance.',
      calculationMethod: 'Sample-weighted mean expectation across closed journal entries.'
    }
  },
  {
    id: 'edge-stability-curve',
    title: 'Edge Stability Curve',
    shortDescription: 'Rolling 10, 20, and 30-trade expectancy curves over sequential trades.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'Is my observed edge steady over time or subject to violent boom-bust swings?',
    requiredFields: ['realizedR', 'date'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 10 }),
    sampleSizeRecommendation: 30,
    iconName: 'TrendingUp',
    explainer: {
      title: 'Edge Stability Curve',
      category: 'Statistical Edge',
      questionAnswered: 'How consistent is my rolling edge across sequential trade samples?',
      whatIsIt: 'Plots rolling average expectancy across moving windows of 10, 20, and 30 trades to visualize edge persistence.',
      whyItMatters: 'Determines whether your overall positive results are driven by a single lucky hot streak or consistent day-in day-out execution.',
      formula: 'RollingExp_k = (1/k) ∑_{i=t-k+1}^{t} R_i',
      variables: [
        { name: 'k', description: 'Window size (e.g. 10, 20, or 30 trades)' },
        { name: 'R_i', description: 'Realized R-multiple of trade i' }
      ],
      interpretation: 'Curves staying above 0R indicate a robust, stable operational edge.',
      limitations: 'Small window sizes (10 trades) have high natural variance.',
      sampleSizeCaution: 'Requires at least 20 trades to plot multi-window rolling curves.',
      calculationMethod: 'Moving window mean on sequential closed trade logs.'
    }
  },
  {
    id: 'winrate-confidence-interval',
    title: 'Win Rate Confidence Interval',
    shortDescription: 'Wilson Score 95% confidence interval around historical win percentage.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'What is the statistical uncertainty range around my observed win rate?',
    requiredFields: ['result'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 50,
    iconName: 'Target',
    explainer: {
      title: 'Win Rate Confidence Interval (Wilson Score)',
      category: 'Statistical Edge',
      questionAnswered: 'Where does my true underlying win probability likely lie given my sample size?',
      whatIsIt: 'Calculates the 95% binomial confidence bounds using the Wilson Score method, which is mathematically superior to normal approximation on small samples.',
      whyItMatters: 'A 60% win rate over 10 trades could easily range from 31% to 83% in reality. Confidence intervals prevent overconfidence.',
      formula: '(p + z²/2n ± z√(p(1-p)/n + z²/4n²)) / (1 + z²/n)',
      variables: [
        { name: 'p', description: 'Observed win rate fraction' },
        { name: 'n', description: 'Total sample size' },
        { name: 'z', description: 'Standard normal critical value (1.96 for 95% CI)' }
      ],
      interpretation: 'Narrower intervals indicate higher confidence that observed performance reflects genuine process.',
      limitations: 'Assumes independent Bernoulli trials.',
      sampleSizeCaution: 'Samples below 30 have wide uncertainty bands.',
      calculationMethod: 'Exact Wilson Score quadratic inversion.'
    }
  },
  {
    id: 'expectancy-confidence-interval',
    title: 'Expectancy Confidence Interval',
    shortDescription: 'Student-t 95% confidence interval on average R-multiple and dollar expectancy.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'How broad is the historical sampling error around my mean trade return?',
    requiredFields: ['realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 30,
    iconName: 'Scale',
    explainer: {
      title: 'Expectancy Confidence Interval',
      category: 'Statistical Edge',
      questionAnswered: 'How confident can I be that my mean expectancy is genuinely greater than zero?',
      whatIsIt: 'Applies Student-t standard error bounds to estimate uncertainty in sample average R-multiple.',
      whyItMatters: 'If the lower confidence bound drops below 0R, the trader cannot yet statistically rule out zero edge at the 95% confidence level.',
      formula: 'Mean(R) ± t_{n-1, 0.975} × (s / √n)',
      variables: [
        { name: 's', description: 'Sample standard deviation of R-multiples' },
        { name: 'n', description: 'Sample size' }
      ],
      interpretation: 'Lower bound > 0 indicates statistically significant positive historical expectancy.',
      limitations: 'Assumes approximate normality of sample means via Central Limit Theorem.',
      sampleSizeCaution: 'Requires n ≥ 15 for reasonable standard error estimation.',
      calculationMethod: 'Student-t distribution standard error scaling.'
    }
  },
  {
    id: 'profit-factor-confidence',
    title: 'Profit Factor Confidence Analysis',
    shortDescription: 'Empirical bootstrap uncertainty analysis of historical Profit Factor.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'How stable is my Profit Factor under trade order resampling?',
    requiredFields: ['pnl'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 8 }),
    sampleSizeRecommendation: 40,
    iconName: 'Activity',
    explainer: {
      title: 'Profit Factor Bootstrap Confidence',
      category: 'Statistical Edge',
      questionAnswered: 'What is the distribution of my Profit Factor across 500 resampled realities?',
      whatIsIt: 'Draws 500 random samples with replacement from recorded trades to build empirical 5th-95th percentile bounds for Profit Factor.',
      whyItMatters: 'Profit Factor is a ratio and can be heavily skewed by a single massive winner or loss.',
      formula: 'PF_{boot} = ∑ Gains_{boot} / ∑ |Losses_{boot}|',
      variables: [
        { name: 'Gains', description: 'Resampled positive trade returns' },
        { name: 'Losses', description: 'Resampled negative trade returns' }
      ],
      interpretation: 'A tight bootstrap distribution indicates resilient payoff and loss containment.',
      limitations: 'Non-parametric; bounded by empirical trade history.',
      sampleSizeCaution: 'Best utilized with 30+ completed trades.',
      calculationMethod: 'Non-parametric bootstrap with 500 iterations.'
    }
  },
  {
    id: 'bootstrapped-pnl-distribution',
    title: 'Bootstrapped P&L Distribution',
    shortDescription: '1,000-draw Monte Carlo resampling of total portfolio P&L outcomes.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'What range of total P&L outcomes were possible with my exact trade set?',
    requiredFields: ['pnl'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 30,
    iconName: 'BarChart2',
    explainer: {
      title: 'Bootstrapped P&L Distribution',
      category: 'Statistical Edge',
      questionAnswered: 'What is the full probability spread of total P&L when resampling recorded trades?',
      whatIsIt: 'Simulates 1,000 alternative paths of your journal to compute 5th, 25th, 50th, 75th, and 95th percentiles of total profit.',
      whyItMatters: 'Exposes how dependent your bottom line was on sequence and lucky alignment of larger positions.',
      formula: 'Total_Pnl^{(m)} = ∑_{j=1}^{n} Pnl_{\\pi(j)}',
      variables: [
        { name: 'm', description: 'Bootstrap trial index (1 to 1,000)' },
        { name: 'n', description: 'Number of trades in sample' }
      ],
      interpretation: 'Shows realistic best-case and worst-case historical ranges.',
      limitations: 'Descriptive resampling of historical trades only.',
      sampleSizeCaution: 'Higher sample sizes create smoother, more reliable distributions.',
      calculationMethod: '1,000 iterations of uniform random replacement sampling.'
    }
  },
  {
    id: 'bootstrapped-expectancy',
    title: 'Bootstrapped Expectancy Spread',
    shortDescription: 'Resampled percentile distribution of R-multiple expectancy.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'What is the percentile distribution (P5 to P95) of my true expectancy?',
    requiredFields: ['realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 30,
    iconName: 'Sparkles',
    explainer: {
      title: 'Bootstrapped Expectancy Spread',
      category: 'Statistical Edge',
      questionAnswered: 'What is the range of mean trade expectancy across 1,000 resamples?',
      whatIsIt: 'Builds a dense distribution of expected value estimates across resampled subsets of your trades.',
      whyItMatters: 'Shows the floor and ceiling of your statistical edge.',
      formula: 'ExpR^{(m)} = (1/n) ∑_{j=1}^{n} R_{\\pi(j)}',
      variables: [
        { name: 'ExpR', description: 'Mean R-multiple in trial m' }
      ],
      interpretation: 'If P5 > 0R, your edge has strong empirical support.',
      limitations: 'Historical resampling only; does not predict future markets.',
      sampleSizeCaution: 'Reliability increases significantly above 30 trades.',
      calculationMethod: '1,000-draw bootstrap mean calculation.'
    }
  },
  {
    id: 'edge-by-sample-size',
    title: 'Edge Convergence by Sample Size',
    shortDescription: 'Tracks convergence of Win Rate, Expectancy, and Profit Factor as sample size grew.',
    category: 'statistical',
    categoryLabel: 'Statistical Edge',
    questionAnswered: 'At what sample size did my trading metrics begin stabilizing?',
    requiredFields: ['pnl', 'realizedR', 'date'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 10 }),
    sampleSizeRecommendation: 30,
    iconName: 'Compass',
    explainer: {
      title: 'Edge Convergence by Sample Size',
      category: 'Statistical Edge',
      questionAnswered: 'How did key performance metrics evolve as more trade data was logged?',
      whatIsIt: 'Plots cumulative Win Rate, Profit Factor, and Expectancy R from trade 1 through trade N.',
      whyItMatters: 'Visualizes the Law of Large Numbers in action and shows when metrics stabilized.',
      formula: 'Metric_N = f(Trade_1, ..., Trade_N)',
      variables: [
        { name: 'N', description: 'Cumulative trade count from start of journal' }
      ],
      interpretation: 'Flatter lines in later trades indicate operational stabilization.',
      limitations: 'Sensitive to shifts in strategy or market volatility over time.',
      sampleSizeCaution: 'Requires at least 15 trades to view convergence trajectory.',
      calculationMethod: 'Cumulative historical progressive aggregation.'
    }
  },

  // B. DISTRIBUTION ANALYSIS
  {
    id: 'trade-contribution-analysis',
    title: 'Trade Contribution & Pareto Analysis',
    shortDescription: 'Quantifies what percentage of total net P&L is driven by the top 1%, 5%, 10%, and 20% of trades.',
    category: 'distribution',
    categoryLabel: 'Distribution Analysis',
    questionAnswered: 'How concentrated is my total profitability in a handful of outlier trades?',
    requiredFields: ['pnl'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 25,
    iconName: 'PieChart',
    explainer: {
      title: 'Trade Contribution & Pareto Analysis',
      category: 'Distribution Analysis',
      questionAnswered: 'What proportion of my profits is generated by the top quintile of trades?',
      whatIsIt: 'Evaluates the Pareto principle (80/20 rule) on your trading journal to determine profit concentration.',
      whyItMatters: 'If 90% of your profits come from 2 trades, your equity curve is fragile and vulnerable to missing key runners.',
      formula: 'TopShare(k%) = (∑ Pnl_{Top k%}) / (∑ Gains) × 100',
      variables: [
        { name: 'Top k%', description: 'Top percentile of trades sorted by net profit' }
      ],
      interpretation: 'A balanced portfolio typically has Top 20% contributing 50-70% of gains.',
      limitations: 'Descriptive metrics only.',
      sampleSizeCaution: 'Requires at least 20 trades for meaningful percentile slicing.',
      calculationMethod: 'Ranked cumulative sum attribution.'
    }
  },
  {
    id: 'outlier-impact-analyzer',
    title: 'Outlier Impact Analyzer',
    shortDescription: 'Simulates net results with and without top 1, 3, 5 winners and largest losses.',
    category: 'distribution',
    categoryLabel: 'Distribution Analysis',
    questionAnswered: 'What would my performance look like without my best 1, 3, or 5 trades?',
    requiredFields: ['pnl', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 20,
    iconName: 'ShieldAlert',
    explainer: {
      title: 'Outlier Impact Analyzer',
      category: 'Distribution Analysis',
      questionAnswered: 'How robust is my trading edge when extreme tail events are filtered out?',
      whatIsIt: 'Recalculates net P&L, win rate, Profit Factor, and average R after removing top 1, 3, and 5 winners as well as worst losses.',
      whyItMatters: 'Verifies whether your strategy maintains positive expectancy on routine trades or relies solely on rare home runs.',
      formula: 'Pnl_{ex-outliers} = TotalPnl - ∑ Pnl_{outliers}',
      variables: [
        { name: 'outliers', description: 'Highest positive or negative P&L entries' }
      ],
      interpretation: 'Strategies remaining positive without top 3 winners possess strong baseline execution.',
      limitations: 'Hypothetical subtraction of actual historical events.',
      sampleSizeCaution: 'Requires at least 15 trades.',
      calculationMethod: 'Sorted order exclusion and recalculation.'
    }
  },
  {
    id: 'pnl-lorenz-curve',
    title: 'P&L Lorenz Curve & Inequality',
    shortDescription: 'Gini coefficient and Lorenz inequality curve of trade profitability.',
    category: 'distribution',
    categoryLabel: 'Distribution Analysis',
    questionAnswered: 'Is my profit distributed equitably or extremely skewed toward few trades?',
    requiredFields: ['pnl'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 10 }),
    sampleSizeRecommendation: 30,
    iconName: 'LineChart',
    explainer: {
      title: 'P&L Lorenz Curve',
      category: 'Distribution Analysis',
      questionAnswered: 'How does cumulative trade share compare to cumulative profit generation?',
      whatIsIt: 'Adapts the economic Lorenz curve to plot cumulative trade percentage vs cumulative profit percentage.',
      whyItMatters: 'Shows whether trade returns follow a power-law distribution (trend following) or Gaussian distribution (scalping).',
      formula: 'Gini = A / (A + B) on cumulative profit curve',
      variables: [
        { name: 'A', description: 'Area between line of equality and Lorenz curve' }
      ],
      interpretation: 'Deeper bow indicates higher payoff asymmetry (fat right tail).',
      limitations: 'Calculated on historical sample.',
      sampleSizeCaution: 'Requires 20+ trades for smooth curve representation.',
      calculationMethod: 'Normalized cumulative sum curve integration.'
    }
  },
  {
    id: 'r-multiple-distribution-map',
    title: 'R-Multiple Distribution Map',
    shortDescription: 'Detailed histogram of realized R-multiples with skewness, kurtosis, and IQR.',
    category: 'distribution',
    categoryLabel: 'Distribution Analysis',
    questionAnswered: 'What is the exact distribution shape of my realized R-multiples?',
    requiredFields: ['realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 30,
    iconName: 'BarChart2',
    explainer: {
      title: 'R-Multiple Distribution Map',
      category: 'Distribution Analysis',
      questionAnswered: 'How are my trades distributed across R buckets (-2R to +5R+)?',
      whatIsIt: 'Categorizes all trades into standardized R bins with summary statistical moments (Mean, Median, Skewness, Kurtosis, IQR, MAD).',
      whyItMatters: 'Reveals stop loss discipline (no trades < -1R) and target extension capability (+3R, +5R).',
      formula: 'R = Realized PnL / Initial Risk at Risk',
      variables: [
        { name: 'R', description: 'Realized multiple of initial 1R risk' }
      ],
      interpretation: 'A tight left tail (-1R ceiling) with an extended right tail is the hallmark of professional risk management.',
      limitations: 'Requires accurate initial risk records.',
      sampleSizeCaution: 'Useful from 10+ trades.',
      calculationMethod: 'Bin frequency mapping and higher statistical moments.'
    }
  },
  {
    id: 'skewness-kurtosis-analyzer',
    title: 'Skewness & Kurtosis Analyzer',
    shortDescription: 'Higher-order moment analysis measuring asymmetry and fat-tail risk.',
    category: 'distribution',
    categoryLabel: 'Distribution Analysis',
    questionAnswered: 'Are my trade outcomes fat-tailed (leptokurtic) and right-skewed?',
    requiredFields: ['realizedR', 'pnl'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 8 }),
    sampleSizeRecommendation: 30,
    iconName: 'Activity',
    explainer: {
      title: 'Skewness & Kurtosis Analyzer',
      category: 'Distribution Analysis',
      questionAnswered: 'What does the third and fourth statistical moment tell me about my trade distribution?',
      whatIsIt: 'Computes Fisher-Pearson standardized skewness and excess kurtosis for P&L and R-multiples.',
      whyItMatters: 'Positive skewness means frequent small losses offset by large occasional gains. High kurtosis indicates fat tails and extreme outlier vulnerability.',
      formula: 'Skewness = E[(X-μ)³]/σ³, Kurtosis = E[(X-μ)⁴]/σ⁴ - 3',
      variables: [
        { name: 'μ', description: 'Sample mean' },
        { name: 'σ', description: 'Sample standard deviation' }
      ],
      interpretation: 'Positive skew is typical of trend strategies; negative skew is common in mean reversion.',
      limitations: 'High sensitivity to extreme sample outliers.',
      sampleSizeCaution: 'Requires at least 25 trades for stable moment estimation.',
      calculationMethod: 'Fisher-Pearson standardized moment algorithms.'
    }
  },
  {
    id: 'robust-central-tendency',
    title: 'Robust Central Tendency Lab',
    shortDescription: 'Compares Mean, Median, 10% Trimmed Mean, Winsorized Mean, and MAD.',
    category: 'distribution',
    categoryLabel: 'Distribution Analysis',
    questionAnswered: 'Is my simple average return heavily distorted by extreme trades?',
    requiredFields: ['pnl', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 20,
    iconName: 'Scale',
    explainer: {
      title: 'Robust Central Tendency Lab',
      category: 'Distribution Analysis',
      questionAnswered: 'What is my typical trade return when statistical distortions are dampened?',
      whatIsIt: 'Compares parametric mean with robust statistics including median, trimmed mean, winsorized mean, and Median Absolute Deviation (MAD).',
      whyItMatters: 'If mean is +$300 but median is -$20, the trader is losing money on typical trades and relying on rare outliers.',
      formula: 'TrimmedMean = Mean(Middle 80% of sorted returns)',
      variables: [
        { name: 'MAD', description: 'Median of absolute deviations from the median' }
      ],
      interpretation: 'Close alignment between Mean, Trimmed Mean, and Median indicates a symmetrical, predictable strategy outcome.',
      limitations: 'Trimmed metrics discard real historical events for exploratory analysis.',
      sampleSizeCaution: 'Requires at least 15 trades.',
      calculationMethod: 'Parametric and non-parametric order statistic estimators.'
    }
  },

  // C. PERFORMANCE STABILITY & SEQUENCES
  {
    id: 'streak-transition-matrix',
    title: 'Streak & Transition Matrix',
    shortDescription: 'Markov state machine analyzing next-trade win rate and risk after 1L, 2L+, 1W, and 2W+.',
    category: 'stability',
    categoryLabel: 'Performance Stability',
    questionAnswered: 'How does my win rate and risk change immediately after a loss or winning streak?',
    requiredFields: ['result', 'pnl', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 8 }),
    sampleSizeRecommendation: 30,
    iconName: 'Activity',
    explainer: {
      title: 'Streak Transition Matrix',
      category: 'Performance Stability',
      questionAnswered: 'Do I suffer from revenge trading or tilt after consecutive losses?',
      whatIsIt: 'Maps conditional transition probabilities P(Win|Loss), P(Loss|Loss), along with average next-trade R and position sizing.',
      whyItMatters: 'Detects psychological decay, revenge risk spikes after losses, or overconfidence sizing after winning streaks.',
      formula: 'P(W | L_k) = Count(Win after k Losses) / Count(k Losses)',
      variables: [
        { name: 'L_k', description: 'State of k consecutive losses' }
      ],
      interpretation: 'If next risk spikes after 2 losses, the trader has an active revenge-trading leak.',
      limitations: 'Requires sequential chronologically sorted trades.',
      sampleSizeCaution: 'Requires 25+ trades for sufficient transition counts.',
      calculationMethod: 'Empirical first-order Markov chain mapping.'
    }
  },
  {
    id: 'autocorrelation-runs-test',
    title: 'Autocorrelation & Runs Randomness Test',
    shortDescription: 'Lags 1-5 serial correlation of returns and Wald-Wolfowitz runs test for sequence randomness.',
    category: 'stability',
    categoryLabel: 'Performance Stability',
    questionAnswered: 'Are my trade outcomes statistically independent or serially clustered?',
    requiredFields: ['realizedR', 'result', 'date'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 10 }),
    sampleSizeRecommendation: 35,
    iconName: 'Sparkles',
    explainer: {
      title: 'Autocorrelation & Runs Test',
      category: 'Performance Stability',
      questionAnswered: 'Is there serial correlation or momentum between consecutive trades?',
      whatIsIt: 'Calculates lag-1 to lag-5 autocorrelation of R-multiples and runs the Wald-Wolfowitz test to test whether win/loss ordering deviates from random Bernoulli trials.',
      whyItMatters: 'Positive autocorrelation suggests hot hands or regime clustering; negative autocorrelation suggests choppy alternating performance.',
      formula: 'Runs Z = (R - E[R]) / σ_R',
      variables: [
        { name: 'R', description: 'Observed number of continuous runs of wins/losses' },
        { name: 'E[R]', description: 'Expected number of runs under independent random null hypothesis' }
      ],
      interpretation: '|Z| > 1.96 rejects sequence randomness at the 5% significance level.',
      limitations: 'Tests sequence ordering only, not strategy profitability.',
      sampleSizeCaution: 'Requires n ≥ 20 for normal approximation validity.',
      calculationMethod: 'Pearson serial correlation and Wald-Wolfowitz non-parametric runs test.'
    }
  },

  // D. RISK-ADJUSTED ANALYTICS & DRAWDOWNS
  {
    id: 'risk-adjusted-return-panel',
    title: 'Risk-Adjusted Return Panel',
    shortDescription: 'Institutional Sharpe, Sortino, Calmar, Ulcer Index, and Recovery Factor calculations.',
    category: 'risk-drawdown',
    categoryLabel: 'Risk-Adjusted & Drawdown',
    questionAnswered: 'How strong is my return per unit of total risk and downside volatility?',
    requiredFields: ['pnl', 'realizedR', 'date'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 5 }),
    sampleSizeRecommendation: 30,
    iconName: 'ShieldAlert',
    explainer: {
      title: 'Risk-Adjusted Return Panel',
      category: 'Risk-Adjusted & Drawdown',
      questionAnswered: 'How efficient is my portfolio return relative to volatility and drawdown pain?',
      whatIsIt: 'Computes institutional risk-adjusted ratios tailored for discrete trade sequences: Sharpe (total volatility), Sortino (downside semi-variance), Calmar (max drawdown), and Ulcer Index (drawdown depth and duration).',
      whyItMatters: 'High returns with massive drawdowns represent uncompensated risk. Risk-adjusted metrics normalize performance.',
      formula: 'Sortino = Mean(R) / DownsideDeviation × √FreqFactor',
      variables: [
        { name: 'DownsideDeviation', description: 'Standard deviation of negative returns only' },
        { name: 'FreqFactor', description: 'Annual trade frequency scaling factor' }
      ],
      interpretation: 'Sortino > 2.0 and Recovery Factor > 3.0 represent top-tier institutional risk management.',
      limitations: 'Annualization factors assume steady trade frequency.',
      sampleSizeCaution: 'Requires 25+ trades for stable semi-variance.',
      calculationMethod: 'Annualized semi-variance and continuous drawdown integration.'
    }
  },
  {
    id: 'underwater-curve-duration',
    title: 'Underwater Curve & Drawdown Durations',
    shortDescription: 'Continuous percentage drawdown depth curve with duration, bottom, and recovery tracking.',
    category: 'risk-drawdown',
    categoryLabel: 'Risk-Adjusted & Drawdown',
    questionAnswered: 'How deep and prolonged have my drawdown periods been historically?',
    requiredFields: ['pnl', 'date'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 25,
    iconName: 'TrendingDown',
    explainer: {
      title: 'Underwater Curve & Drawdown Durations',
      category: 'Risk-Adjusted & Drawdown',
      questionAnswered: 'What is the full lifecycle (start, trough, recovery) of my drawdown episodes?',
      whatIsIt: 'Plots equity distance from all-time high watermark and tabulates every discrete drawdown period by trade count, dollar depth, and recovery status.',
      whyItMatters: 'Drawdown duration causes more psychological capital destruction than drawdown depth. Knowing your recovery duration is crucial for trade sizing.',
      formula: 'Drawdown_t = (Peak_t - Equity_t) / Peak_t × 100',
      variables: [
        { name: 'Peak_t', description: 'Highest historical equity watermark achieved up to time t' }
      ],
      interpretation: 'Faster recovery and shallow depth indicate resilient strategy edge.',
      limitations: 'Dependent on initial account balance setting.',
      sampleSizeCaution: 'Effective with any closed trade history.',
      calculationMethod: 'High-watermark continuous tracking algorithm.'
    }
  },
  {
    id: 'performance-waterfall',
    title: 'Performance Waterfall & Attribution',
    shortDescription: 'Visual bridge from starting equity to gross wins, gross losses, friction/costs, and final balance.',
    category: 'risk-drawdown',
    categoryLabel: 'Risk-Adjusted & Drawdown',
    questionAnswered: 'How did gross gains, gross losses, and transaction costs shape my ending equity?',
    requiredFields: ['pnl'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 15,
    iconName: 'BarChart2',
    explainer: {
      title: 'Performance Waterfall',
      category: 'Risk-Adjusted & Drawdown',
      questionAnswered: 'Where did my capital accumulate and where did it leak away?',
      whatIsIt: 'Institutional waterfall bridge decomposing starting capital into gross positive trade contributions, gross losses, execution friction/costs, and ending equity.',
      whyItMatters: 'Provides an immediate bird’s-eye view of gross edge vs friction loss.',
      formula: 'EndingEquity = StartingEquity + GrossWins - |GrossLosses| - Costs',
      variables: [
        { name: 'GrossWins', description: 'Sum of all positive trade profits' },
        { name: 'GrossLosses', description: 'Sum of all negative trade losses' }
      ],
      interpretation: 'Clear visual audit of capital flows.',
      limitations: 'Static representation of total sample.',
      sampleSizeCaution: 'Effective across all sample sizes.',
      calculationMethod: 'Segmented additive waterfall aggregation.'
    }
  },

  // E. CAPITAL & SIZING EFFICIENCY
  {
    id: 'risk-bucket-analysis',
    title: 'Historical Risk Bucket Analysis',
    shortDescription: 'Compares performance across risk sizing tiers (0-0.25%, 0.25-0.5%, 0.5-1%, 1-2%, 2%+).',
    category: 'efficiency',
    categoryLabel: 'Capital & Risk Efficiency',
    questionAnswered: 'Do I perform better when risking smaller percentages vs larger percentages?',
    requiredFields: ['riskPercentage', 'pnl', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 25,
    iconName: 'Zap',
    explainer: {
      title: 'Risk Bucket Analysis',
      category: 'Capital & Risk Efficiency',
      questionAnswered: 'What is my win rate and average R across different risk percentage sizes?',
      whatIsIt: 'Segments trades into 5 standardized risk categories and compares win rate, average R, and net P&L.',
      whyItMatters: 'Uncovers whether taking higher risk leads to emotional degradation, premature exits, or enhanced returns.',
      formula: 'RiskBucket_k = { t | Risk_min ≤ Risk(t) < Risk_max }',
      variables: [
        { name: 'Risk', description: 'Risk as percentage of account equity at entry' }
      ],
      interpretation: 'If high risk buckets show lower win rates, the trader may be experiencing size-induced anxiety.',
      limitations: 'Requires risk percentage logged in trade records.',
      sampleSizeCaution: 'Requires sufficient trades per bucket.',
      calculationMethod: 'Segmented conditional grouping and metrics calculation.'
    }
  },

  // F. EXECUTION & COSTS
  {
    id: 'commission-cost-drag',
    title: 'Commission, Swap & Cost Drag Analyzer',
    shortDescription: 'Analyzes commission, overnight swaps, fees, and their drag percentage on gross profits.',
    category: 'execution',
    categoryLabel: 'Execution & Cost Friction',
    questionAnswered: 'How much of my gross trading profits are consumed by broker commissions and swaps?',
    requiredFields: ['commission', 'pnl'],
    isAvailable: (trades: Trade[]) => {
      const withCosts = trades.filter(t => t.commission || (t as any).mt5ScreenshotMetadata?.commission || t.swap);
      return {
        available: withCosts.length > 0,
        presentCount: withCosts.length,
        totalCount: trades.length,
        missingReason: 'Commission/swap metadata is not logged on these trades.'
      };
    },
    sampleSizeRecommendation: 20,
    iconName: 'DollarSign',
    explainer: {
      title: 'Commission & Cost Drag Analyzer',
      category: 'Execution & Cost Friction',
      questionAnswered: 'What percentage of my gross alpha is surrendered to broker execution fees?',
      whatIsIt: 'Aggregates actual recorded commissions, swap fees, and platform spreads to calculate cost drag percentage.',
      whyItMatters: 'High-frequency scalpers frequently discover that 30-50% of gross edge is lost to broker friction.',
      formula: 'CostDrag% = (TotalCosts / GrossProfit) × 100',
      variables: [
        { name: 'TotalCosts', description: 'Sum of commissions, financing swaps, and exchange fees' }
      ],
      interpretation: 'Lower cost drag (< 10%) maximizes trader retention of strategy alpha.',
      limitations: 'Only calculates costs explicitly recorded in trades or MT5 logs.',
      sampleSizeCaution: 'Effective with any trades containing cost metadata.',
      calculationMethod: 'Direct additive fee ledger analysis.'
    }
  },

  // G. STRATEGY & PORTFOLIO INTERACTION
  {
    id: 'directional-asymmetry-analyzer',
    title: 'Directional Asymmetry Analyzer (BUY vs SELL)',
    shortDescription: 'In-depth comparison of Long vs Short positions across Win Rate, Avg R, P&L, and PF.',
    category: 'strategy-portfolio',
    categoryLabel: 'Strategy & Portfolio Interaction',
    questionAnswered: 'Do I have a significant structural bias or edge in Long versus Short trades?',
    requiredFields: ['direction', 'pnl', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 25,
    iconName: 'Compass',
    explainer: {
      title: 'Directional Asymmetry Analyzer',
      category: 'Strategy & Portfolio Interaction',
      questionAnswered: 'Is my performance symmetrical between Long (BUY) and Short (SELL) trades?',
      whatIsIt: 'Compares Win Rate, Profit Factor, Average R, Net P&L, and trade frequency between Long and Short positions.',
      whyItMatters: 'Many traders exhibit subconscious bullish bias or fail to execute short setups with equal discipline.',
      formula: 'AsymmetryDelta = Metric(Long) - Metric(Short)',
      variables: [
        { name: 'Direction', description: 'Trade order direction (BUY vs SELL)' }
      ],
      interpretation: 'Reveals directional favoritism or market trend dependency.',
      limitations: 'Market macro conditions over the sampled period influence outcomes.',
      sampleSizeCaution: 'Requires at least 10 trades per direction.',
      calculationMethod: 'Dual cohort conditional slicing.'
    }
  },
  {
    id: 'strategy-session-matrix',
    title: 'Strategy × Session Cross-Matrix',
    shortDescription: '2D matrix crossing strategy performance against Asian, London, and New York sessions.',
    category: 'strategy-portfolio',
    categoryLabel: 'Strategy & Portfolio Interaction',
    questionAnswered: 'Which of my strategies perform best in specific trading sessions?',
    requiredFields: ['strategy', 'session', 'pnl', 'realizedR'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 30,
    iconName: 'Layers',
    explainer: {
      title: 'Strategy × Session Cross-Matrix',
      category: 'Strategy & Portfolio Interaction',
      questionAnswered: 'How does session liquidity and volatility interact with my specific setups?',
      whatIsIt: 'Constructs an interactive 2D heatmap matrix crossing every strategy against each trading session.',
      whyItMatters: 'A breakout strategy might excel in London/NY overlaps but fail in quiet Asian sessions.',
      formula: 'Cell(Strat, Sess) = { Trades, WinRate, AvgR, NetPnL }',
      variables: [
        { name: 'Strat', description: 'Selected trading playbook strategy' },
        { name: 'Sess', description: 'Market session (Asian, London, NY, Sydney)' }
      ],
      interpretation: 'Identifies optimal setup-session combinations for playbook optimization.',
      limitations: 'Cells with under 5 trades should be treated as preliminary.',
      sampleSizeCaution: 'Requires 20+ trades distributed across sessions.',
      calculationMethod: '2D bivariate aggregation.'
    }
  },

  // H. RESEARCH & CUSTOM BUILDERS
  {
    id: 'correlation-matrix-lab',
    title: 'Quantitative Correlation Matrix Lab',
    shortDescription: 'Pearson correlation matrix across Realized R, P&L, Risk %, Position Size, and Duration.',
    category: 'research',
    categoryLabel: 'Research Tools',
    questionAnswered: 'Which quantitative trading variables are linearly correlated with trade outcome?',
    requiredFields: ['realizedR', 'pnl', 'riskPercentage'],
    isAvailable: (trades: Trade[]) => ({ available: trades.length >= 8 }),
    sampleSizeRecommendation: 25,
    iconName: 'Layers',
    explainer: {
      title: 'Correlation Matrix Lab',
      category: 'Research Tools',
      questionAnswered: 'How strongly do sizing, duration, and risk correlate with profitability?',
      whatIsIt: 'Computes a full Pearson correlation coefficient matrix (-1.0 to +1.0) across all continuous numerical metrics in your journal.',
      whyItMatters: 'Helps identify whether holding trades longer increases R or merely introduces giveback risk.',
      formula: 'r_{xy} = ∑(x_i - x̄)(y_i - ȳ) / (√∑(x_i - x̄)² √∑(y_i - ȳ)²)',
      variables: [
        { name: 'r_{xy}', description: 'Pearson correlation coefficient' }
      ],
      interpretation: 'Values near +1 or -1 show strong linear association; values near 0 show independence.',
      limitations: 'Correlation does not imply causation. Only captures linear relationships.',
      sampleSizeCaution: 'Requires 20+ trades for meaningful correlation estimates.',
      calculationMethod: 'Standardized bivariate Pearson product-moment.'
    }
  },

  // I. DATA QUALITY & RELIABILITY
  {
    id: 'data-completeness-analytics',
    title: 'Analytics Data Completeness & Quality',
    shortDescription: 'Audit showing percentage of trades with complete SL, TP, Risk, Strategy, Session, and Screenshot data.',
    category: 'data-quality',
    categoryLabel: 'Data Quality & Reliability',
    questionAnswered: 'How complete and reliable is my trading log metadata for deep statistical analysis?',
    requiredFields: [],
    isAvailable: (trades: Trade[]) => ({ available: trades.length > 0 }),
    sampleSizeRecommendation: 10,
    iconName: 'CheckCircle2',
    explainer: {
      title: 'Data Completeness & Quality Audit',
      category: 'Data Quality & Reliability',
      questionAnswered: 'What percentage of my journal entries have full institutional metadata?',
      whatIsIt: 'Audits every trade against 10 critical parameters: Entry/Exit prices, SL, TP, Risk %, Strategy, Session, Emotions, Screenshots, Rules, and Setup Quality.',
      whyItMatters: 'Garbage in, garbage out. Higher data completeness unlocks higher fidelity statistical insights.',
      formula: 'Completeness% = (TradesWithField / TotalTrades) × 100',
      variables: [
        { name: 'Field', description: 'Specific metadata attribute required for advanced analytics' }
      ],
      interpretation: 'Aim for > 90% completeness across all categories for institutional analysis.',
      limitations: 'Measures logging discipline, not trading profitability.',
      sampleSizeCaution: 'Applies across all sample sizes.',
      calculationMethod: 'Field presence assertion audit.'
    }
  }
];
