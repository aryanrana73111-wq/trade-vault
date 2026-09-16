import os
import re

path = 'src/types/aiLabs.ts'
with open(path, 'r') as f:
    content = f.read()

replacement = """  possibleAlternatives: string[];
  counterEvidence?: string;
  limitation?: string;
  nextTest?: string;
  tradeIds: string[];"""

content = content.replace("  possibleAlternatives: string[];\n  tradeIds: string[];", replacement)

with open(path, 'w') as f:
    f.write(content)

print("AI Types Fixed")
