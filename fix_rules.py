import os

path = 'firestore.rules'
with open(path, 'r') as f:
    content = f.read()

arena_rules = """
    match /arenas/{arenaId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      
      match /shared_trades/{tradeId} {
        allow read, write: if isSignedIn();
      }
    }
"""

if "/arenas/{arenaId}" not in content:
    content = content.replace("    match /test/{docId} {", arena_rules + "\n    match /test/{docId} {")

with open(path, 'w') as f:
    f.write(content)
