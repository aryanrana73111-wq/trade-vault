const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '..', 'node_modules', 'vite', 'dist', 'client', 'client.mjs'),
  path.join(__dirname, '..', 'node_modules', 'vite', 'dist', 'node', 'module-runner.js')
];

for (const file of targets) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('ws.send(JSON.stringify(data));') && !content.includes('if (ws && typeof ws.send === "function")')) {
      content = content.replace(
        /ws\.send\(JSON\.stringify\(data\)\);/g,
        'if (ws && typeof ws.send === "function") { ws.send(JSON.stringify(data)); }'
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[patch-vite] Patched ${file}`);
    }
  }
}
