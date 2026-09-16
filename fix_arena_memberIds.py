import os

path = 'src/types.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("members: Record<string, ArenaMember>;", "members: Record<string, ArenaMember>;\n  memberIds: string[];")

with open(path, 'w') as f:
    f.write(content)
