import os

path = 'vite.config.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("devOptions: {\n          enabled: true,", "devOptions: {\n          enabled: process.env.DISABLE_HMR !== 'true',")

with open(path, 'w') as f:
    f.write(content)
