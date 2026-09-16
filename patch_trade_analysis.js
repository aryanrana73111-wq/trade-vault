import fs from 'fs';
let code = fs.readFileSync('src/components/analytics/TradeAnalysisTab.tsx', 'utf-8');
code = code.replace(
  /<TradeDetailModal[\s\S]*?\/>/,
  `<TradeDetailModal 
          trade={selectedTrade}
          isOpen={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onEditFullTrade={() => {}}
        />`
);
fs.writeFileSync('src/components/analytics/TradeAnalysisTab.tsx', code);
