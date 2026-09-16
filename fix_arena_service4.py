import os

path = 'src/lib/arenaService.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("projection.emotions = trade.emotions;", "projection.emotions = trade.duringEmotions as string[] || [];")

with open(path, 'w') as f:
    f.write(content)
