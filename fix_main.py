import os

path = 'src/main.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("import { AcademyProvider } from '@/contexts/AcademyContext';", "import { AcademyProvider } from '@/contexts/AcademyContext';\nimport { ArenaProvider } from '@/contexts/ArenaContext';")
content = content.replace("<AcademyProvider>", "<ArenaProvider>\n              <AcademyProvider>")
content = content.replace("</AcademyProvider>", "</AcademyProvider>\n            </ArenaProvider>")

with open(path, 'w') as f:
    f.write(content)
