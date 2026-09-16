import os
import glob

files = [
    "src/components/academy/AcademyHome.tsx",
    "src/components/academy/CompetencyDashboard.tsx",
    "src/components/academy/FormulaSheetTab.tsx",
    "src/components/academy/KnowledgeLibraryTab.tsx",
    "src/components/academy/ProgressDashboardTab.tsx",
    "src/components/academy/QuizzesTab.tsx",
    "src/components/academy/SkillTreeTab.tsx"
]

replacement = """  const domainsList: AcademyDomain[] = [
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

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    import re
    # Find the domainsList array and replace it
    new_content = re.sub(r"  const domainsList: AcademyDomain\[\] = \[\n    'Market Knowledge',\n    'Technical Analysis',\n    'Risk Management',\n    'Execution',\n    'Trading Psychology',\n    'Quantitative Analysis',\n    'Portfolio Management',\n    'Professional Practice'\n  \];", replacement, content)
    
    with open(f, 'w') as file:
        file.write(new_content)

print("Done replacing domainsList")
