import os

f = "src/components/academy/assessment/AssessmentChartViewer.tsx"
with open(f, 'r') as file:
    content = file.read()
    
content = content.replace("<svg viewBox=\"0 0 400 160\" className=\"w-full h-full\">", "<svg viewBox=\"0 0 400 160\" className=\"w-full h-full\" role=\"img\" aria-label={data.caption}>")

with open(f, 'w') as file:
    file.write(content)

print("Done patching ARIA")
