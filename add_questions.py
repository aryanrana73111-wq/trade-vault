import os

f = "src/data/academy/assessmentQuestions.ts"
with open(f, 'r') as file:
    content = file.read()
    
# Find the array end
new_questions = """
  ,
  // New visual questions
  {
    id: 'aq-equity-comparison',
    domain: 'Portfolio Management',
    targetLevel: 8,
    type: 'chart-interpretation',
    question: 'Compare the two equity curves. Which trader demonstrates better risk-adjusted returns (higher Sharpe/Sortino) assuming identical total net profit?',
    context: 'Trader A (Blue) vs Trader B (Green)',
    chartData: {
      type: 'equity-curve',
      caption: 'Equity Curve Comparison (100 Trades)',
      elements: {
        points: [
          {x:20, y:120}, {x:60, y:80}, {x:100, y:140}, {x:140, y:60}, {x:180, y:130}, {x:220, y:50}, {x:260, y:140}, {x:300, y:40}, {x:340, y:110}, {x:380, y:30}
        ],
        points2: [
          {x:20, y:120}, {x:60, y:115}, {x:100, y:105}, {x:140, y:100}, {x:180, y:90}, {x:220, y:80}, {x:260, y:70}, {x:300, y:65}, {x:340, y:45}, {x:380, y:30}
        ]
      }
    },
    options: [
      'Trader A (Blue), because they have higher highs',
      'Trader B (Green), because the variance (volatility) of their returns is much lower, leading to smaller drawdowns',
      'They have the exact same risk-adjusted returns since the starting and ending points are identical',
      'Trader A (Blue), because they recovered from drawdowns faster'
    ],
    correctIndex: 1,
    explanation: 'Risk-adjusted return metrics like the Sharpe or Sortino ratio penalize volatility and downside deviation. A smoother equity curve with smaller drawdowns (Trader B) yields a significantly higher risk-adjusted return than a highly volatile curve (Trader A), even if both achieve the same total profit.',
    skillEvaluated: 'Risk-Adjusted Return Analysis'
  },
  {
    id: 'aq-distribution-skew',
    domain: 'Quantitative Analysis',
    targetLevel: 7,
    type: 'chart-interpretation',
    question: 'What does this trade outcome probability distribution indicate about the underlying strategy?',
    context: 'Y-axis: Frequency, X-axis: R-Multiple outcome per trade',
    chartData: {
      type: 'probability-distribution',
      caption: 'Trade Outcome Distribution',
      elements: {
        distribution: [
          {value: -3, count: 5},
          {value: -1, count: 45},
          {value: 0, count: 10},
          {value: 1, count: 20},
          {value: 2, count: 12},
          {value: 5, count: 8}
        ]
      }
    },
    options: [
      'It is a mean-reverting strategy with a high win rate but large tail risks.',
      'It is a trend-following strategy with a positive right skew (fat right tail) and strictly controlled standard losses (-1R), but occasional risk management failures (-3R).',
      'It is a perfectly normal (Gaussian) distribution.',
      'The strategy is guaranteed to lose money over time due to the high frequency of -1R losses.'
    ],
    correctIndex: 1,
    explanation: 'The distribution shows a large cluster of -1R losses (typical of trend following where you get stopped out often), but a long right tail (+2R, +5R) capturing large wins. The existence of -3R events shows occasional failure to respect the 1R stop loss (slippage, gaps, or lack of discipline).',
    skillEvaluated: 'Return Distribution Profiling'
  },
  {
    id: 'aq-drawdown-recovery',
    domain: 'Risk Management',
    targetLevel: 6,
    type: 'chart-interpretation',
    question: 'Looking at this drawdown chart, what happens to the mathematical recovery required as the drawdown deepens?',
    context: 'Peak-to-Trough Drawdown Depth',
    chartData: {
      type: 'drawdown-chart',
      caption: 'Strategy Maximum Drawdown',
      elements: {
        points: [
          {x:20, y:20}, {x:60, y:40}, {x:100, y:30}, {x:140, y:80}, {x:180, y:60}, {x:220, y:140}, {x:260, y:100}, {x:300, y:150}, {x:340, y:120}, {x:380, y:20}
        ]
      }
    },
    options: [
      'The recovery percentage required is exactly equal to the drawdown percentage.',
      'The recovery percentage required grows exponentially; a 50% drawdown requires a 100% gain to recover.',
      'Drawdowns have no mathematical impact on future returns.',
      'A deeper drawdown makes it statistically easier to recover due to mean reversion.'
    ],
    correctIndex: 1,
    explanation: 'The mathematics of ruin dictate that recovery is asymmetrical. A 10% loss requires an 11.1% gain to recover, but a 50% loss requires a 100% gain, and a 90% loss requires a 900% gain. This is why strict risk limits are the bedrock of survival.',
    skillEvaluated: 'Drawdown Mathematics & Asymmetry'
  }
"""

content = content.replace("  }\n];", "  }" + new_questions + "\n];")

with open(f, 'w') as file:
    file.write(content)

print("Done adding questions")
