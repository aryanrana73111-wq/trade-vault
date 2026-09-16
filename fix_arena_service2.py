import os

path = 'src/lib/arenaService.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("export async function syncTradeToArenas(userId: string, trade: Trade, activeArenas: Arena[]) {", "export async function syncTradeToArenas(userId: string, trade: Trade, activeArenas?: Arena[]) {\n  if (!activeArenas) {\n    activeArenas = await getUserActiveArenas(userId);\n  }")

with open(path, 'w') as f:
    f.write(content)
