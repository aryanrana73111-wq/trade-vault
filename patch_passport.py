import os
import re

f = "src/components/academy/CompetencyDashboard.tsx"
with open(f, 'r') as file:
    content = file.read()
    
content = content.replace("Skill Passport & Skill Verification", "Skill Passport")
content = content.replace("Multi-domain competency assessment measuring practical market structure, execution, and risk calculations. Track your verified learning state from Not Started through Strong.", "Educational competency record measuring practical market structure, execution, and risk knowledge. Track your verified learning state from Not Started through Strong. This is an educational and research framework, not an employment credential.")

with open(f, 'w') as file:
    file.write(content)

print("Done patching passport")
