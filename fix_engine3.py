import os
import re

f = "src/lib/academy/adaptiveLearningEngine.ts"
with open(f, 'r') as file:
    content = file.read()

content = re.sub(r"const DOMAIN_INSTITUTIONAL_RISKS: Record<AcademyDomain, string> = \{\n  'Risk Management': 'Unhedged exposure and non-invariant position sizing lead directly to asymmetrical drawdown and mathematical ruin.',\n  'Execution': 'Aggressive market orders and poor liquidity timing incur invisible friction taxes that degrade mathematical edge.',\n  'Trading Psychology': 'Cognitive biases like loss aversion and revenge trading lead to breaking risk rules during standard variance streaks.',\n  'Technical Analysis': 'Misidentifying institutional market structure and invalidation levels results in poor risk-to-reward ratios.',\n  'Quantitative Analysis': 'Ignoring expected value, variance, and sample size leads to abandoning statistically sound trading edges prematurely.',\n  'Portfolio Management': 'Concentrated sector factor risk and correlated asset holdings amplify portfolio beta during systemic volatility shocks.',\n  'Market Knowledge': 'Failing to understand continuous double auctions, clearinghouses, and liquidity pools distorts market perception.',\n  'Professional Practice': 'Operating without institutional workflows, pre-trade checklists, and mandates prevents scalable, consistent performance.'\n\};", """const DOMAIN_INSTITUTIONAL_RISKS: Record<AcademyDomain, string> = {
  'Risk Management': 'Unhedged exposure and non-invariant position sizing lead directly to asymmetrical drawdown and mathematical ruin.',
  'Execution': 'Aggressive market orders and poor liquidity timing incur invisible friction taxes that degrade mathematical edge.',
  'Trading Psychology': 'Cognitive biases like loss aversion and revenge trading lead to breaking risk rules during standard variance streaks.',
  'Technical Analysis': 'Misidentifying institutional market structure and invalidation levels results in poor risk-to-reward ratios.',
  'Quantitative Analysis': 'Ignoring expected value, variance, and sample size leads to abandoning statistically sound trading edges prematurely.',
  'Portfolio Management': 'Concentrated sector factor risk and correlated asset holdings amplify portfolio beta during systemic volatility shocks.',
  'Market Knowledge': 'Failing to understand continuous double auctions, clearinghouses, and liquidity pools distorts market perception.',
  'Professional Practice': 'Operating without institutional workflows, pre-trade checklists, and mandates prevents scalable, consistent performance.',
  'Fundamental Analysis': 'Failing to grasp macro and micro fundamentals leads to structurally weak theses.',
  'Behavioral Finance': 'Unawareness of cognitive biases guarantees sub-optimal decision making under uncertainty.',
  'Derivatives': 'Trading complex instruments without understanding their non-linear risk profiles.',
  'Macro Economics': 'Ignoring global liquidity and monetary policy shifts.',
  'Market Microstructure': 'Trading against hidden liquidity constraints and toxic flow.',
  'Research': 'Lack of formalized hypotheses and robust backtesting procedures.'
};""", content)

with open(f, 'w') as file:
    file.write(content)

print("Done fixing engine 3")
