import fs from 'fs';
let code = fs.readFileSync('src/pages/Analytics.tsx', 'utf-8');

// Replace imports
code = code.replace(
  /import \{ EquityChart \} from '@\/components\/analytics\/EquityChart';[\s\S]*?import \{ getJournalEmpiricalSummary \} from '@\/lib\/academy\/ecosystemBridge';/,
  `import { OverviewTab } from '@/components/analytics/OverviewTab';
import { PerformanceTab } from '@/components/analytics/PerformanceTab';
import { TradeAnalysisTab } from '@/components/analytics/TradeAnalysisTab';
import { StrategyResearchTab } from '@/components/analytics/StrategyResearchTab';
import { BehavioralAnalyticsTab } from '@/components/analytics/BehavioralAnalyticsTab';
import { EvidenceExplorerModal } from '@/components/analytics/EvidenceExplorerModal';`
);

// Replace validTabs
code = code.replace(
  /const validTabs = \['overview', 'distributions', 'markets', 'execution'\] as const;/,
  `const validTabs = ['overview', 'performance', 'tradeAnalysis', 'strategyResearch', 'behavioral'] as const;`
);

// We need to add the new filter states. Let's find the filter states block.
const filterStatesRegex = /const \[macroContext, setMacroContext\] = useState\('All Macro Contexts'\);/;
code = code.replace(
  filterStatesRegex,
  `const [macroContext, setMacroContext] = useState('All Macro Contexts');
  const [timeframe, setTimeframe] = useState('All Timeframes');
  const [emotion, setEmotion] = useState('All Emotions');
  const [riskPercent, setRiskPercent] = useState('All Risk %');
  const [rMultiple, setRMultiple] = useState('All R Multiples');
  const [ruleAdherence, setRuleAdherence] = useState('All Adherence');`
);

// We need to update resetFilters
const resetFiltersRegex = /setMacroContext\('All Macro Contexts'\);\n\s*\};/;
code = code.replace(
  resetFiltersRegex,
  `setMacroContext('All Macro Contexts');
    setTimeframe('All Timeframes');
    setEmotion('All Emotions');
    setRiskPercent('All Risk %');
    setRMultiple('All R Multiples');
    setRuleAdherence('All Adherence');
  };`
);

// Update activeFilterCount
const activeFilterCountRegex = /macroContext !== 'All Macro Contexts'\n\s*\]\.filter\(Boolean\)\.length;/;
code = code.replace(
  activeFilterCountRegex,
  `macroContext !== 'All Macro Contexts',
    timeframe !== 'All Timeframes',
    emotion !== 'All Emotions',
    riskPercent !== 'All Risk %',
    rMultiple !== 'All R Multiples',
    ruleAdherence !== 'All Adherence'
  ].filter(Boolean).length;`
);

// Add to filteredTrades
const filterLogicRegex = /return dateMatch && marketMatch && directionMatch && sessionMatch && strategyMatch && resultMatch && macroMatch;/;
code = code.replace(
  filterLogicRegex,
  `// 8. Timeframe
      const timeframeMatch = timeframe === 'All Timeframes' || trade.timeframe === timeframe;
      // 9. Emotion
      const emotionMatch = emotion === 'All Emotions' || (trade.emotions && trade.emotions.includes(emotion));
      // 10. Risk Percent
      let riskMatch = true;
      if (riskPercent === '< 1%') riskMatch = (trade.riskPercent || 0) < 1;
      else if (riskPercent === '1-2%') riskMatch = (trade.riskPercent || 0) >= 1 && (trade.riskPercent || 0) <= 2;
      else if (riskPercent === '> 2%') riskMatch = (trade.riskPercent || 0) > 2;
      // 11. R Multiple
      let rMatch = true;
      if (rMultiple === '< 0R') rMatch = (trade.rMultiple || 0) < 0;
      else if (rMultiple === '0-1R') rMatch = (trade.rMultiple || 0) >= 0 && (trade.rMultiple || 0) <= 1;
      else if (rMultiple === '1-2R') rMatch = (trade.rMultiple || 0) > 1 && (trade.rMultiple || 0) <= 2;
      else if (rMultiple === '2-3R') rMatch = (trade.rMultiple || 0) > 2 && (trade.rMultiple || 0) <= 3;
      else if (rMultiple === '> 3R') rMatch = (trade.rMultiple || 0) > 3;
      // 12. Rule Adherence
      let ruleMatch = true;
      if (ruleAdherence === '100%') ruleMatch = trade.ruleAdherence === 100;
      else if (ruleAdherence === '80-99%') ruleMatch = (trade.ruleAdherence || 0) >= 80 && (trade.ruleAdherence || 0) < 100;
      else if (ruleAdherence === '< 80%') ruleMatch = (trade.ruleAdherence || 0) < 80;

      return dateMatch && marketMatch && directionMatch && sessionMatch && strategyMatch && resultMatch && macroMatch && timeframeMatch && emotionMatch && riskMatch && rMatch && ruleMatch;`
);

const filterDepsRegex = /\[trades, dateRange, customStart, customEnd, market, direction, session, strategy, result, macroContext\]\);/;
code = code.replace(
  filterDepsRegex,
  `[trades, dateRange, customStart, customEnd, market, direction, session, strategy, result, macroContext, timeframe, emotion, riskPercent, rMultiple, ruleAdherence]);`
);


// Replace the tabs UI
const tabsUiRegex = /<div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">[\s\S]*?\}\)/g;
code = code.replace(
  tabsUiRegex,
  `<div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button onClick={() => handleSelectTab('overview')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Overview</button>
              <button onClick={() => handleSelectTab('performance')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'performance' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Performance</button>
              <button onClick={() => handleSelectTab('tradeAnalysis')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'tradeAnalysis' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Trade Analysis</button>
              <button onClick={() => handleSelectTab('strategyResearch')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'strategyResearch' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Strategy Research</button>
              <button onClick={() => handleSelectTab('behavioral')} className={\`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap \${activeTab === 'behavioral' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}\`}>Behavioral Analytics</button>
            </div>

            {activeTab === 'overview' && <OverviewTab trades={filteredTrades} metrics={kpis} />}
            {activeTab === 'performance' && <PerformanceTab trades={filteredTrades} metrics={kpis} />}
            {activeTab === 'tradeAnalysis' && <TradeAnalysisTab trades={filteredTrades} />}
            {activeTab === 'strategyResearch' && <StrategyResearchTab trades={filteredTrades} />}
            {activeTab === 'behavioral' && <BehavioralAnalyticsTab trades={filteredTrades} />}
`
);

fs.writeFileSync('src/pages/Analytics.tsx', code);
