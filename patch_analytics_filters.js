import fs from 'fs';
let code = fs.readFileSync('src/pages/Analytics.tsx', 'utf-8');

// Add const options
const optionsRegex = /const MACRO_OPTIONS = \['All Macro Contexts', 'News Catalyst Trades Only', 'Standard Sessions Only', 'High Impact Catalyst Only'\];/;
code = code.replace(
  optionsRegex,
  `const MACRO_OPTIONS = ['All Macro Contexts', 'News Catalyst Trades Only', 'Standard Sessions Only', 'High Impact Catalyst Only'];
const TIMEFRAME_OPTIONS = ['All Timeframes', '1m', '3m', '5m', '15m', '30m', '1H', '4H', 'Daily', 'Other'];
const EMOTION_OPTIONS = ['All Emotions', 'Calm', 'FOMO', 'Revenge', 'Fear', 'Greed', 'Confident', 'Hesitant', 'Impatient', 'Overconfident', 'Frustrated', 'Neutral'];
const RISK_OPTIONS = ['All Risk %', '< 1%', '1-2%', '> 2%'];
const R_MULTIPLE_OPTIONS = ['All R Multiples', '< 0R', '0-1R', '1-2R', '2-3R', '> 3R'];
const RULE_ADHERENCE_OPTIONS = ['All Adherence', '100%', '80-99%', '< 80%'];`
);

// Add dropdowns in JSX
const filterUI = `            <FilterDropdown 
              label="Result"
              value={result}
              options={RESULT_OPTIONS}
              onChange={setResult}
              defaultVal="All Trades"
            />`;

code = code.replace(filterUI, filterUI + `
            <FilterDropdown 
              label="Timeframe"
              value={timeframe}
              options={TIMEFRAME_OPTIONS}
              onChange={setTimeframe}
              defaultVal="All Timeframes"
            />
            <FilterDropdown 
              label="Emotion"
              value={emotion}
              options={EMOTION_OPTIONS}
              onChange={setEmotion}
              defaultVal="All Emotions"
            />
            <FilterDropdown 
              label="Risk %"
              value={riskPercent}
              options={RISK_OPTIONS}
              onChange={setRiskPercent}
              defaultVal="All Risk %"
            />
            <FilterDropdown 
              label="R Multiple"
              value={rMultiple}
              options={R_MULTIPLE_OPTIONS}
              onChange={setRMultiple}
              defaultVal="All R Multiples"
            />
            <FilterDropdown 
              label="Rule Adherence"
              value={ruleAdherence}
              options={RULE_ADHERENCE_OPTIONS}
              onChange={setRuleAdherence}
              defaultVal="All Adherence"
            />`);

fs.writeFileSync('src/pages/Analytics.tsx', code);
