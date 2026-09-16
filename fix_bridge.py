import os
import re

f = "src/lib/academy/ecosystemBridge.ts"
with open(f, 'r') as file:
    content = file.read()
    
content = content.replace("else if (domain === 'Psychology') {", "else if (domain === 'Trading Psychology') {")

with open(f, 'w') as file:
    file.write(content)

print("Done fixing bridge")
