import fs from 'fs';
let code = fs.readFileSync('src/pages/Analytics.tsx', 'utf-8');

const uiMatch = code.match(/<div className="space-y-6">[\s\S]*?<EvidenceExplorerModal /);
if (uiMatch) {
  code = code.replace(
    uiMatch[0],
    `<div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button onClick={() => handleSelectTab('overview')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Overview</button>
              <button onClick={() => handleSelectTab('performance')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'performance' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Performance</button>
              <button onClick={() => handleSelectTab('tradeAnalysis')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'tradeAnalysis' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Trade Analysis</button>
              <button onClick={() => handleSelectTab('strategyResearch')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'strategyResearch' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Strategy Research</button>
              <button onClick={() => handleSelectTab('behavioral')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'behavioral' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Behavioral Analytics</button>
            </div>

            {activeTab === 'overview' && <OverviewTab trades={filteredTrades} metrics={kpis} onOpenEvidence={handleOpenEvidence} />}
            {activeTab === 'performance' && <PerformanceTab trades={filteredTrades} metrics={kpis} />}
            {activeTab === 'tradeAnalysis' && <TradeAnalysisTab trades={filteredTrades} />}
            {activeTab === 'strategyResearch' && <StrategyResearchTab trades={filteredTrades} />}
            {activeTab === 'behavioral' && <BehavioralAnalyticsTab trades={filteredTrades} />}
          </div>
        )}
      </div>

      <EvidenceExplorerModal `
  );
  fs.writeFileSync('src/pages/Analytics.tsx', code);
}
