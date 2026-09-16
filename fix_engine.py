import os

f = "src/lib/academy/adaptiveLearningEngine.ts"
with open(f, 'r') as file:
    content = file.read()
    
content = content.replace("'Psychology':", "'Trading Psychology':")
content = content.replace("'Quantitative':", "'Quantitative Analysis':")
content = content.replace("'Portfolio':", "'Portfolio Management':")
content = content.replace("'Professional':", "'Professional Practice':")

content = content.replace("'Psychology',", "'Trading Psychology',")
content = content.replace("'Quantitative',", "'Quantitative Analysis',")
content = content.replace("'Portfolio',", "'Portfolio Management',")
content = content.replace("'Professional'", "'Professional Practice'")

with open(f, 'w') as file:
    file.write(content)

print("Done fixing engine")
