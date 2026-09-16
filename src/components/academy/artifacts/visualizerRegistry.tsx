import React from 'react';
import { AcademyDomain, CurriculumCategory } from '@/types/academy';

// Import all 21 Phase 3 Visualizations
import { EducationalLineChart } from './EducationalLineChart';
import { EducationalBarChart } from './EducationalBarChart';
import { EducationalAreaChart } from './EducationalAreaChart';
import { EducationalProgressRing } from './EducationalProgressRing';
import { EducationalDomainProgressChart } from './EducationalDomainProgressChart';
import { EducationalRiskDiagram } from './EducationalRiskDiagram';
import { EducationalEquityCurve } from './EducationalEquityCurve';
import { EducationalDrawdownCurve } from './EducationalDrawdownCurve';
import { EducationalProbabilityDistribution } from './EducationalProbabilityDistribution';
import { EducationalRRVisualizer } from './EducationalRRVisualizer';
import { EducationalPositionSizeVisualizer } from './EducationalPositionSizeVisualizer';
import { EducationalCompoundingCurve } from './EducationalCompoundingCurve';
import { EducationalCorrelationChart } from './EducationalCorrelationChart';
import { EducationalMarketStructureDiagram } from './EducationalMarketStructureDiagram';
import { EducationalOrderBookDiagram } from './EducationalOrderBookDiagram';
import { EducationalBidAskVisualizer } from './EducationalBidAskVisualizer';
import { EducationalOptionsPayoffDiagram } from './EducationalOptionsPayoffDiagram';
import { EducationalPortfolioCircleChart } from './EducationalPortfolioCircleChart';
import { EducationalTimeline } from './EducationalTimeline';
import { EducationalDecisionTree } from './EducationalDecisionTree';
import { EducationalConceptGraph } from './EducationalConceptGraph';

export interface VisualizerMeta {
  id: string;
  type: string;
  number: number;
  title: string;
  category: CurriculumCategory;
  domain: AcademyDomain;
  description: string;
  formulaHighlight?: string;
  useCase: string;
  badge: string;
  component: React.ComponentType;
}

export const ACADEMY_VISUALIZERS: VisualizerMeta[] = [
  {
    id: 'volatility-dispersion-line',
    type: 'line-chart',
    number: 1,
    title: 'Volatility Dispersion Line Chart',
    category: 'QUANTITATIVE TRADING',
    domain: 'Quantitative Analysis',
    description: 'Dynamic multi-regime asset dispersion simulator with tunable annualized volatility sigma.',
    formulaHighlight: 'St = S0 · exp((μ - 0.5σ²)t + σ√t · Z)',
    useCase: 'Volatility Cone Calibration & Drift Modeling',
    badge: 'Interactive Simulator',
    component: EducationalLineChart
  },
  {
    id: 'r-multiple-bar',
    type: 'bar-chart',
    number: 2,
    title: 'R-Multiple Frequency & Edge Bar Chart',
    category: 'SYSTEMATIC TRADING',
    domain: 'Quantitative Analysis',
    description: 'Empirical trade outcome distribution showing positive skew and win-rate expectancy.',
    formulaHighlight: 'Expectancy (EV) = Σ(Outcome_i × Prob_i)',
    useCase: 'Asymmetric Payoff Profiling & Profit Factor',
    badge: 'Interactive Simulator',
    component: EducationalBarChart
  },
  {
    id: 'volume-profile-area',
    type: 'area-chart',
    number: 3,
    title: 'Volume Profile & Value Area Chart',
    category: 'MARKET MICROSTRUCTURE',
    domain: 'Market Knowledge',
    description: 'Horizontal volume distribution displaying Point of Control (POC), VAH, and VAL liquidity boundaries.',
    formulaHighlight: 'Value Area (VA) = 70% of Cumulative Session Volume',
    useCase: 'Auction Balance & High-Volume Node Support',
    badge: 'Auction Mechanics',
    component: EducationalAreaChart
  },
  {
    id: 'curriculum-progress-ring',
    type: 'progress-ring',
    number: 4,
    title: 'Curriculum Progression Ring',
    category: 'TRADING FUNDAMENTALS',
    domain: 'Professional Practice',
    description: 'Radial multi-tier milestone tracker auditing foundational mastery across Levels 0 to 10.',
    formulaHighlight: 'Mastery % = (Mastered Competencies / 140 Core Nodes) × 100',
    useCase: 'Milestone Tracking & Readiness Gate',
    badge: 'Progress Tracker',
    component: EducationalProgressRing
  },
  {
    id: 'domain-competency-radar',
    type: 'domain-progress',
    number: 5,
    title: 'Domain Competency Radar Chart',
    category: 'PORTFOLIO MANAGEMENT',
    domain: 'Professional Practice',
    description: 'Multi-axis radar and skill distribution across all 8 institutional academy domains.',
    formulaHighlight: 'Readiness Index = Harmonic Mean of 8 Domain Percentiles',
    useCase: 'Blindspot Diagnostics & Skill Balancing',
    badge: 'Competency Matrix',
    component: EducationalDomainProgressChart
  },
  {
    id: 'risk-invariance-diagram',
    type: 'risk-diagram',
    number: 6,
    title: 'Risk Invariance & Position Sizing Diagram',
    category: 'RISK MANAGEMENT',
    domain: 'Risk Management',
    description: 'Dynamic mechanics proving how adjusting stop distances rescales share counts while preserving exact 1R loss invariance.',
    formulaHighlight: 'Position Units = (Account Capital × Risk %) / |Entry - Stop|',
    useCase: 'Capital Preservation & Volatility Normalization',
    badge: 'Core Law',
    component: EducationalRiskDiagram
  },
  {
    id: 'system-equity-curve',
    type: 'equity-curve',
    number: 7,
    title: 'System Expectancy Equity Curve',
    category: 'SYSTEMATIC TRADING',
    domain: 'Quantitative Analysis',
    description: 'Simulating multi-decade capital growth paths comparing positive expectancy against random betting friction.',
    formulaHighlight: 'EV = (Win Rate × Win Size) - (Loss Rate × Loss Size)',
    useCase: 'Longevity Testing & Variance Normalization',
    badge: 'Simulation',
    component: EducationalEquityCurve
  },
  {
    id: 'underwater-drawdown-curve',
    type: 'drawdown-curve',
    number: 8,
    title: 'Dual Equity & Underwater Drawdown Profile',
    category: 'RISK MANAGEMENT',
    domain: 'Risk Management',
    description: 'Exposing the non-linear geometric penalty of deep drawdowns and calculating required recovery return multipliers.',
    formulaHighlight: 'Required Breakeven % = (DD% / (100 - DD%)) × 100',
    useCase: 'Drawdown Circuit Breakers & Ruin Avoidance',
    badge: 'Risk Theory',
    component: EducationalDrawdownCurve
  },
  {
    id: 'probability-distribution',
    type: 'probability-distribution',
    number: 9,
    title: 'Fat-Tailed Market Kurtosis Distribution',
    category: 'QUANTITATIVE TRADING',
    domain: 'Quantitative Analysis',
    description: 'Contrasting theoretical Gaussian bell curves against empirical fat-tailed leptokurtic financial shocks and black swans.',
    formulaHighlight: 'Excess Kurtosis = (μ4 / σ⁴) - 3',
    useCase: 'Tail Risk Profiling & Extreme Event Modeling',
    badge: 'Quantitative Law',
    component: EducationalProbabilityDistribution
  },
  {
    id: 'risk-reward-visualizer',
    type: 'rr-visualizer',
    number: 10,
    title: 'Risk-to-Reward Geometry & Breakeven Visualizer',
    category: 'TRADING FUNDAMENTALS',
    domain: 'Risk Management',
    description: 'Geometric price ladder mapping entry, stop loss, and target boxes to compute mandatory breakeven win rates.',
    formulaHighlight: 'Breakeven Win Rate = 1 / (1 + Reward:Risk Ratio)',
    useCase: 'Trade Qualification & Target Alignment',
    badge: 'Core Mechanic',
    component: EducationalRRVisualizer
  },
  {
    id: 'position-size-sandbox',
    type: 'position-size-visualizer',
    number: 11,
    title: 'Dynamic Position Size & Leverage Sandbox',
    category: 'RISK MANAGEMENT',
    domain: 'Risk Management',
    description: 'Live interactive calculation sandbox taking capital balance, risk %, and stop distance to output exact share units and margin leverage.',
    formulaHighlight: 'Units = Risk $ / Stop Distance | Leverage = Notional / Equity',
    useCase: 'Execution Order Sizing & Margin Safety',
    badge: 'Sandbox Tool',
    component: EducationalPositionSizeVisualizer
  },
  {
    id: 'compounding-growth-curve',
    type: 'compounding-curve',
    number: 12,
    title: 'Exponential Compounding & Reinvestment Curve',
    category: 'PORTFOLIO MANAGEMENT',
    domain: 'Portfolio Management',
    description: 'Interactive comparison between simple linear withdrawals and exponential capital reinvestment across monthly horizons.',
    formulaHighlight: 'A = P · (1 + r)^t',
    useCase: 'Long-Term Capital Scaling & Patience Discipline',
    badge: 'Growth Engine',
    component: EducationalCompoundingCurve
  },
  {
    id: 'cross-correlation-chart',
    type: 'correlation-chart',
    number: 13,
    title: 'Asset Interdependence & Cross-Correlation Chart',
    category: 'PORTFOLIO MANAGEMENT',
    domain: 'Portfolio Management',
    description: 'Interactive simulation of two asset time series testing Pearson correlation (r) from -1.0 inverse hedge to +1.0 cluster risk.',
    formulaHighlight: 'r = Cov(X, Y) / (σX · σY)',
    useCase: 'Multi-Asset Hedging & True Diversification',
    badge: 'Portfolio Defense',
    component: EducationalCorrelationChart
  },
  {
    id: 'market-structure-diagram',
    type: 'market-structure-diagram',
    number: 14,
    title: 'Market Structure & Swing Point Geometry',
    category: 'TECHNICAL ANALYSIS',
    domain: 'Technical Analysis',
    description: 'Fractal swing point mapper demonstrating clean Higher Highs/Lows (Uptrend), Lower Highs/Lows (Downtrend), and CHOCH reversals.',
    formulaHighlight: 'Regime Rule: Uptrend = {HH_t > HH_{t-1}, HL_t > HL_{t-1}}',
    useCase: 'Directional Bias & Invalidation Placement',
    badge: 'Price Action',
    component: EducationalMarketStructureDiagram
  },
  {
    id: 'level-2-order-book',
    type: 'order-book-diagram',
    number: 15,
    title: 'Level 2 Order Book & Liquidity Ladder',
    category: 'MARKET MICROSTRUCTURE',
    domain: 'Execution',
    description: 'Simulated Depth of Market (DOM) displaying passive resting limit bids, asks, and order queue thickness.',
    formulaHighlight: 'Spread = Best Ask - Best Bid | Depth = Σ Resting Units',
    useCase: 'Order Flow Analysis & Support Cluster Detection',
    badge: 'Microstructure',
    component: EducationalOrderBookDiagram
  },
  {
    id: 'bid-ask-friction-visualizer',
    type: 'bid-ask-visualizer',
    number: 16,
    title: 'Bid/Ask Auction Dynamics & Immediate Friction',
    category: 'EXECUTION',
    domain: 'Execution',
    description: 'Visual demonstration of crossing the bid/ask spread with aggressive market orders versus capturing spread via passive limits.',
    formulaHighlight: 'Taker Friction = Shares × (Ask - Bid)',
    useCase: 'Slippage Minimization & Execution TCA',
    badge: 'Execution Edge',
    component: EducationalBidAskVisualizer
  },
  {
    id: 'options-payoff-diagram',
    type: 'options-payoff',
    number: 17,
    title: 'Options Expiration Payoff & Asymmetry Profiles',
    category: 'DERIVATIVES',
    domain: 'Quantitative Analysis',
    description: 'Hockey-stick payoff diagrams for Long Calls, Puts, Covered Calls, and Straddles modeling convex nonlinear outcomes.',
    formulaHighlight: 'Call P&L = Max(0, S_T - K) - Premium',
    useCase: 'Defined-Risk Hedging & Volatility Trading',
    badge: 'Convexity Lab',
    component: EducationalOptionsPayoffDiagram
  },
  {
    id: 'portfolio-circle-chart',
    type: 'portfolio-circle',
    number: 18,
    title: 'Portfolio Asset Allocation & Risk Contribution Circle',
    category: 'PORTFOLIO MANAGEMENT',
    domain: 'Portfolio Management',
    description: 'Donut chart comparing traditional capital weighting against actual volatility-weighted Risk Parity risk contributions.',
    formulaHighlight: 'Risk Contribution_i = w_i · (Cov(R_i, R_p) / σ_p)',
    useCase: 'All-Weather Asset Balancing & Macro Resilience',
    badge: 'Asset Allocation',
    component: EducationalPortfolioCircleChart
  },
  {
    id: 'market-shocks-timeline',
    type: 'timeline',
    number: 19,
    title: 'Historical Market Shocks & Liquidity Crises Timeline',
    category: 'MACRO',
    domain: 'Market Knowledge',
    description: 'Interactive chronology of systemic crashes (1987, 1998, 2008, 2010, 2020, 2023) detailing microstructure collapse mechanisms.',
    formulaHighlight: 'Liquidity Paradox: Liquidity is only continuous until you need it.',
    useCase: 'Crisis Preparedness & Black Swan Defense',
    badge: 'Historical Lab',
    component: EducationalTimeline
  },
  {
    id: 'execution-decision-tree',
    type: 'decision-tree',
    number: 20,
    title: 'Systematic Trade Qualification Decision Tree',
    category: 'SYSTEMATIC TRADING',
    domain: 'Execution',
    description: 'Interactive conditional logic gate enforcing institutional discipline through regime, volatility, setup, and R:R filters.',
    formulaHighlight: 'Trade Authorized ⇔ (Regime == Valid ∧ ATR ≤ Limit ∧ R:R ≥ 1.5)',
    useCase: 'Emotional Elimination & Systematic Execution',
    badge: 'Discipline Gate',
    component: EducationalDecisionTree
  },
  {
    id: 'concept-relationship-graph',
    type: 'concept-graph',
    number: 21,
    title: 'Topological Concept Relationship Graph',
    category: 'CURRICULUM ARCHITECTURE' as any,
    domain: 'Professional Practice',
    description: 'Interactive visual node network connecting market foundational theory through microstructure and risk to positive EV.',
    formulaHighlight: 'Graph G = (V, E) where Directed Edges encode Prerequisite Mastery',
    useCase: 'Curriculum Navigation & Synthesis Mastery',
    badge: 'Network Graph',
    component: EducationalConceptGraph
  }
];

export const getVisualizerById = (id: string): VisualizerMeta | undefined => {
  return ACADEMY_VISUALIZERS.find(v => v.id === id || v.type === id);
};
