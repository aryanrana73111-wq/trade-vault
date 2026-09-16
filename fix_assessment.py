import os

f = "src/data/academy/assessmentEngine.ts"
with open(f, 'r') as file:
    content = file.read()
    
replacement = """const ALL_DOMAINS: AcademyDomain[] = [
  'Market Knowledge',
  'Technical Analysis',
  'Fundamental Analysis',
  'Risk Management',
  'Execution',
  'Trading Psychology',
  'Behavioral Finance',
  'Quantitative Analysis',
  'Portfolio Management',
  'Derivatives',
  'Macro Economics',
  'Market Microstructure',
  'Research',
  'Professional Practice'
];"""

import re
new_content = re.sub(r"const ALL_DOMAINS: AcademyDomain\[\] = \[\n  'Market Knowledge',\n  'Technical Analysis',\n  'Risk Management',\n  'Execution',\n  'Trading Psychology',\n  'Quantitative Analysis',\n  'Portfolio Management',\n  'Professional Practice'\n\];", replacement, content)

with open(f, 'w') as file:
    file.write(new_content)

print("Done fixing ALL_DOMAINS")
