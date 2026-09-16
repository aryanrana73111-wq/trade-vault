import fs from 'fs';
let code = fs.readFileSync('src/components/analytics/BehavioralAnalyticsTab.tsx', 'utf-8');

const regex = /trades\.forEach\(t => t\.emotions\?\.forEach\(e => emotions\.add\(e\)\)\);/;
code = code.replace(
  regex,
  `trades.forEach(t => {
      t.emotions?.forEach(e => emotions.add(e));
      t.duringEmotions?.forEach(e => emotions.add(e));
    });`
);

const regex2 = /const emotionTrades = trades\.filter\(t => t\.emotions\?\.includes\(emotion\)\);/;
code = code.replace(
  regex2,
  `const emotionTrades = trades.filter(t => t.emotions?.includes(emotion) || t.duringEmotions?.includes(emotion));`
);

fs.writeFileSync('src/components/analytics/BehavioralAnalyticsTab.tsx', code);
