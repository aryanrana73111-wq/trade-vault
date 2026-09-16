import os
import re

path = 'src/contexts/DataContext.tsx'
with open(path, 'r') as f:
    content = f.read()

# add import for syncTradeToArenas
if "import { syncTradeToArenas } from '../lib/arenaService';" not in content:
    content = content.replace("import { Trade, Strategy, LearningEntry, TradingRule } from '../types';", "import { Trade, Strategy, LearningEntry, TradingRule } from '../types';\nimport { syncTradeToArenas } from '../lib/arenaService';")

# saveTrade modification
saveTrade_regex = r"(const saveTrade = async.*?setDoc\(newDoc, trade\);)(.*?return trade;)"
def saveTrade_repl(m):
    return m.group(1) + "\n    try { await syncTradeToArenas(user.uid, trade); } catch(e) { console.error('Arena sync failed', e); }" + m.group(2)
content = re.sub(saveTrade_regex, saveTrade_repl, content, flags=re.DOTALL)

# updateTrade modification
updateTrade_regex = r"(const updateTrade = async.*?setDoc\(docRef, fullTrade\);)(.*?\}\n)"
def updateTrade_repl(m):
    return m.group(1) + "\n    try { await syncTradeToArenas(user.uid, fullTrade); } catch(e) { console.error('Arena sync failed', e); }" + m.group(2)
content = re.sub(updateTrade_regex, updateTrade_repl, content, flags=re.DOTALL)

with open(path, 'w') as f:
    f.write(content)
