import os

path = 'src/lib/arenaService.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace("members: {\n      [ownerId]: member\n    },", "members: {\n      [ownerId]: member\n    },\n    memberIds: [ownerId],")

content = content.replace("await updateDoc(arenaDoc.ref, {\n    [`members.${userId}`]: member,\n    updatedAt: Date.now()\n  });", "const updatedMemberIds = [...(arena.memberIds || []), userId];\n  await updateDoc(arenaDoc.ref, {\n    [`members.${userId}`]: member,\n    memberIds: updatedMemberIds,\n    updatedAt: Date.now()\n  });")

content = content.replace("const q = query(collection(db, 'arenas'));", "const q = query(collection(db, 'arenas'), where('memberIds', 'array-contains', userId));")

with open(path, 'w') as f:
    f.write(content)
