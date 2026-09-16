import os
import re

path = 'src/contexts/DataContext.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "await setDoc(newDoc, cleanUndefined(trade));\n    return trade;",
    "await setDoc(newDoc, cleanUndefined(trade));\n    try { await syncTradeToArenas(user.uid, trade); } catch(e) { console.error('Arena sync failed', e); }\n    return trade;"
)

content = content.replace(
    "await setDoc(tradeRef, cleanUndefined({ ...updates, updatedAt: Date.now() }), { merge: true });",
    "const updatedTrade = { ...trades.find(t => t.id === id), ...updates, updatedAt: Date.now() } as Trade;\n    await setDoc(tradeRef, cleanUndefined(updatedTrade), { merge: true });\n    try { await syncTradeToArenas(user.uid, updatedTrade); } catch(e) { console.error('Arena sync failed', e); }"
)

with open(path, 'w') as f:
    f.write(content)
