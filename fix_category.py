import os

f = "src/components/academy/AcademyEcosystemBridge.tsx"
with open(f, 'r') as file:
    content = file.read()
    
content = content.replace("category: isRiskDomain ? 'Risk Management' : isPsychologyDomain ? 'Trading Psychology' : 'Strategy',", "category: isRiskDomain ? 'Risk Management' : isPsychologyDomain ? 'Psychology' : 'Strategy',")

with open(f, 'w') as file:
    file.write(content)

print("Done fixing category")
