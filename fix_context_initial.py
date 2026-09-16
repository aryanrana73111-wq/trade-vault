import os
import re

f = "src/contexts/AcademyContext.tsx"
with open(f, 'r') as file:
    content = file.read()
    
# Replace domainMastery initialization
content = re.sub(r"  domainMastery: \{\n    'Market Knowledge': 0,\n    'Technical Analysis': 0,\n    'Risk Management': 0,\n    'Execution': 0,\n    'Trading Psychology': 0,\n    'Quantitative Analysis': 0,\n    'Portfolio Management': 0,\n    'Professional Practice': 0\n  \}", """  domainMastery: {
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
  }""", content)

with open(f, 'w') as file:
    file.write(content)

print("Done fixing context initial")
