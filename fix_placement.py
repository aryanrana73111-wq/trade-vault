import os
import re

f = "src/data/academy/placementTest.ts"
with open(f, 'r') as file:
    content = file.read()
    
# Replace domainTotals
content = re.sub(r"  const domainTotals: Record<AcademyDomain, \{ total: number; correct: number \}> = \{\n    'Market Knowledge': \{ total: 0, correct: 0 \},\n    'Technical Analysis': \{ total: 0, correct: 0 \},\n    'Risk Management': \{ total: 0, correct: 0 \},\n    'Execution': \{ total: 0, correct: 0 \},\n    'Trading Psychology': \{ total: 0, correct: 0 \},\n    'Quantitative Analysis': \{ total: 0, correct: 0 \},\n    'Portfolio Management': \{ total: 0, correct: 0 \},\n    'Professional Practice': \{ total: 0, correct: 0 \}\n  \};", """  const domainTotals: Record<AcademyDomain, { total: number; correct: number }> = {
    'Market Knowledge': { total: 0, correct: 0 },
    'Technical Analysis': { total: 0, correct: 0 },
    'Fundamental Analysis': { total: 0, correct: 0 },
    'Risk Management': { total: 0, correct: 0 },
    'Execution': { total: 0, correct: 0 },
    'Trading Psychology': { total: 0, correct: 0 },
    'Behavioral Finance': { total: 0, correct: 0 },
    'Quantitative Analysis': { total: 0, correct: 0 },
    'Portfolio Management': { total: 0, correct: 0 },
    'Derivatives': { total: 0, correct: 0 },
    'Macro Economics': { total: 0, correct: 0 },
    'Market Microstructure': { total: 0, correct: 0 },
    'Research': { total: 0, correct: 0 },
    'Professional Practice': { total: 0, correct: 0 }
  };""", content)

# Replace domainScores
content = re.sub(r"  const domainScores: Record<AcademyDomain, number> = \{\n    'Market Knowledge': 0,\n    'Technical Analysis': 0,\n    'Risk Management': 0,\n    'Execution': 0,\n    'Trading Psychology': 0,\n    'Quantitative Analysis': 0,\n    'Portfolio Management': 0,\n    'Professional Practice': 0\n  \};", """  const domainScores: Record<AcademyDomain, number> = {
    'Market Knowledge': 0,
    'Technical Analysis': 0,
    'Fundamental Analysis': 0,
    'Risk Management': 0,
    'Execution': 0,
    'Trading Psychology': 0,
    'Behavioral Finance': 0,
    'Quantitative Analysis': 0,
    'Portfolio Management': 0,
    'Derivatives': 0,
    'Macro Economics': 0,
    'Market Microstructure': 0,
    'Research': 0,
    'Professional Practice': 0
  };""", content)

with open(f, 'w') as file:
    file.write(content)

print("Done fixing placement test")
