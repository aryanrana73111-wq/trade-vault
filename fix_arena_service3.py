import os

path = 'src/lib/arenaService.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("projection.exit = trade.exit;", "projection.exit = trade.exitPrice;")
content = content.replace("projection.setup = trade.setup;", "projection.setup = trade.setupQuality;")
content = content.replace("projection.mistakes = trade.mistakes;", "projection.mistakes = trade.whatToAvoid ? [trade.whatToAvoid] : [];")
content = content.replace("projection.ruleAdherence = trade.ruleAdherence;", "projection.ruleAdherence = trade.ruleAdherence?.toString();")

with open(path, 'w') as f:
    f.write(content)
