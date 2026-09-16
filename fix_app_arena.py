import os

path = 'src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("import Dashboard from '@/pages/Dashboard';", "import Dashboard from '@/pages/Dashboard';\nimport ArenaPage from '@/pages/Arena';")
content = content.replace("<Route path=\"command-center\" element={<CommandCenter />} />", "<Route path=\"command-center\" element={<CommandCenter />} />\n        <Route path=\"arena\" element={<ArenaPage />} />")

with open(path, 'w') as f:
    f.write(content)
