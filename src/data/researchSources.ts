import { ResearchSourceItem } from './strategyResearchTypes';

export const RESEARCH_SOURCES_CATALOG: ResearchSourceItem[] = [
  {
    id: 'src-aqr-trend',
    title: 'A Century of Evidence on Trend-Following Investing',
    author: 'Brian Hurst, Yao Hua Ooi, Lasse Heje Pedersen',
    institution: 'AQR Capital Management / NYU Stern',
    publicationDate: '2017-06-15',
    sourceType: 'ASSET MANAGER RESEARCH',
    urlOrCitation: 'Journal of Portfolio Management, Vol. 44, No. 1, 2017',
    relevantClaims: [
      'Time-series momentum (trend-following) exhibits persistent positive returns across equities, bonds, currencies, and commodities over a century of data (1880-2016).',
      'Provides structural diversification during severe market equity drawdowns and inflationary shocks.'
    ],
    limitations: [
      'Gross of simulated friction models; real-world slippage on illiquid commodities reduces net Sharpe ratio.',
      'Sustained range-bound or whipsaw market regimes generate prolonged drawdowns.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-moskowitz-tsm',
    title: 'Time Series Momentum',
    author: 'Tobias J. Moskowitz, Yao Hua Ooi, Lasse Heje Pedersen',
    institution: 'Journal of Financial Economics',
    publicationDate: '2012-05-01',
    sourceType: 'ACADEMIC',
    urlOrCitation: 'Journal of Financial Economics 104(2), 228-250',
    relevantClaims: [
      '1 to 12-month past excess returns predict positive future excess returns for the subsequent 1 to 12 months across 58 liquid futures contracts.',
      'Effect partially reverses at longer horizons (2 to 5 years), consistent with behavioral sentiment theories.'
    ],
    limitations: [
      'Focuses on monthly rebalanced futures; does not validate intraday or scalping momentum claims without empirical verification.',
      'Requires dynamic volatility scaling to prevent concentrated drawdown in high-beta assets.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-jegadeesh-titman',
    title: 'Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency',
    author: 'Narasimhan Jegadeesh, Sheridan Titman',
    institution: 'Journal of Finance',
    publicationDate: '1993-03-01',
    sourceType: 'ACADEMIC',
    urlOrCitation: 'Journal of Finance 48(1), 65-91',
    relevantClaims: [
      'Cross-sectional relative momentum strategies selecting past 3-12 month outperformers beat benchmark indices over 3-12 month holding periods.',
      'Attributable to delayed price reactions to earnings and analyst underreaction.'
    ],
    limitations: [
      'High turnover produces severe transaction friction unless managed via rebalance buffers.',
      'Prone to severe momentum crashes during sudden market turnarounds.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-carhart-fama',
    title: 'Common Risk Factors in the Returns on Stocks and Bonds',
    author: 'Eugene F. Fama, Kenneth R. French',
    institution: 'Journal of Financial Economics',
    publicationDate: '1993-02-01',
    sourceType: 'ACADEMIC',
    urlOrCitation: 'Journal of Financial Economics 33(1), 3-56',
    relevantClaims: [
      'Identified systematic premiums in Size (SMB) and Value (HML) factors beyond standard market beta.',
      'Factor premiums explain cross-sectional dispersion across equity classes over multi-decade cycles.'
    ],
    limitations: [
      'Value factor experienced prolonged multi-year underperformance during growth/tech expansion cycles.',
      'Small cap premiums can disappear net of bid-ask spreads and liquidity constraints.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-cftc-cot',
    title: 'Disaggregated Commitments of Traders (CoT) Reporting Standards',
    author: 'Commodity Futures Trading Commission (CFTC)',
    institution: 'United States Commodity Futures Trading Commission',
    publicationDate: '2019-10-01',
    sourceType: 'REGULATORY',
    urlOrCitation: 'CFTC Division of Market Oversight Market Reporting Guides',
    relevantClaims: [
      'Commercial hedgers versus Non-Commercial speculative positioning reflects aggregate institutional liquidity balance.',
      'Extreme positioning percentiles frequently precede sentiment exhaustion points.'
    ],
    limitations: [
      'Reporting data lags spot market by 3 trading days (published on Friday with Tuesday data cut-off).',
      'Trending markets can sustain extreme positioning readings for extended durations without immediate reversal.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-bis-fx-carry',
    title: 'The Carry Trade and Currency Crash Risk',
    author: 'Craig Burnside, Martin Eichenbaum, Isaac Kleshchelski, Sergio Rebelo',
    institution: 'Bank for International Settlements / NBER',
    publicationDate: '2011-04-10',
    sourceType: 'INSTITUTIONAL',
    urlOrCitation: 'BIS Working Paper Series No. 344',
    relevantClaims: [
      'G10 FX Carry strategies generate positive excess returns over normal conditions due to Forward Premium Puzzle.',
      'Subject to severe negative skewness ("picking up nickels in front of steamrollers") during global liquidity stress.'
    ],
    limitations: [
      'Requires strict macro volatility regime filters and stop-loss rules to avoid catastrophic drawdowns during flight-to-safety episodes.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-cme-microstructure',
    title: 'Order Book Depth and Institutional Execution Dynamics in Micro E-mini Futures',
    author: 'CME Group Research & Product Development',
    institution: 'CME Group Research',
    publicationDate: '2023-01-20',
    sourceType: 'EXCHANGE RESEARCH',
    urlOrCitation: 'CME Group Quantitative Research Reports',
    relevantClaims: [
      'Volume Profile and Volume Weighted Average Price (VWAP) benchmarks represent true institutional clearing price references.',
      'Liquidity gaps beyond Value Area boundaries create asymmetric mean-reverting or trend-continuation profiles.'
    ],
    limitations: [
      'Execution slippage escalates around high-impact macroeconomic releases (CPI, FOMC, NFP).',
      'Intraday volume patterns differ substantially between regular trading hours (RTH) and overnight session.'
    ],
    evidenceQuality: 'High'
  },
  {
    id: 'src-lo-adaptive',
    title: 'The Adaptive Markets Hypothesis: Market Efficiency from an Evolutionary Perspective',
    author: 'Andrew W. Lo',
    institution: 'MIT Sloan School of Management',
    publicationDate: '2004-10-01',
    sourceType: 'ACADEMIC',
    urlOrCitation: 'Journal of Portfolio Management 30(5), 15-29',
    relevantClaims: [
      'Market efficiency is not an absolute state but evolves dynamically as market participants adapt to changing environments.',
      'Strategies that perform exceptionally in one regime inevitably decay or degrade when crowd concentration alters market microstructure.'
    ],
    limitations: [
      'Predicting exact regime transition timing remains computationally non-trivial in live trading.'
    ],
    evidenceQuality: 'High'
  }
];
