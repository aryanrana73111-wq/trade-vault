import os

path = 'src/contexts/DataContext.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("await setDoc(newDoc, trade);\n    return trade;", "await setDoc(newDoc, trade);\n    try { await syncTradeToArenas(user.uid, trade); } catch(e) { console.error('Arena sync failed', e); }\n    return trade;")

content = content.replace("await setDoc(docRef, fullTrade);\n  };", "await setDoc(docRef, fullTrade);\n    try { await syncTradeToArenas(user.uid, fullTrade); } catch(e) { console.error('Arena sync failed', e); }\n  };")

with open(path, 'w') as f:
    f.write(content)
