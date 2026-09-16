import { Trade } from '@/types';

export type CompletionStatus = 'Complete' | 'Partially Complete' | 'Needs Review';

export interface MissingFieldItem {
  id: string;
  label: string;
  category: 'Execution' | 'Risk' | 'Strategy' | 'Screenshot' | 'Journal' | 'Psychology';
  description: string;
  isConfiguredImportant?: boolean;
}

export interface SectionStatus {
  status: 'Complete' | 'Missing' | 'Not Applicable';
  missingFields: string[];
  description?: string;
}

export interface TradeCompletenessResult {
  status: CompletionStatus;
  percentage: number;
  missingItems: MissingFieldItem[];
  completedItems: MissingFieldItem[];
  hasMissingData: boolean;
  sections: {
    summary: SectionStatus;
    execution: SectionStatus;
    risk: SectionStatus;
    strategy: SectionStatus;
    screenshot: SectionStatus;
    psychology: SectionStatus;
    notes: SectionStatus;
    mistake: SectionStatus;
    learning: SectionStatus;
  };
}

/**
 * Inspects a trade and detects any missing journal fields.
 * Follows core principle:
 * Incomplete is not the same as invalid.
 * Missing fields are clearly enumerated without fake values.
 */
export function getTradeCompleteness(trade: Trade): TradeCompletenessResult {
  const missingItems: MissingFieldItem[] = [];
  const completedItems: MissingFieldItem[] = [];

  // Helper to record
  const checkField = (
    fieldId: string,
    label: string,
    category: MissingFieldItem['category'],
    isComplete: boolean,
    description: string,
    isImportant: boolean = true
  ) => {
    const item: MissingFieldItem = {
      id: fieldId,
      label,
      category,
      description,
      isConfiguredImportant: isImportant,
    };
    if (isComplete) {
      completedItems.push(item);
    } else {
      missingItems.push(item);
    }
  };

  // 1. Screenshot Check
  const hasScreenshot = Boolean(
    (trade.screenshot && trade.screenshot.trim().length > 0) ||
    (trade.entryScreenshot && trade.entryScreenshot.trim().length > 0) ||
    (trade.exitScreenshot && trade.exitScreenshot.trim().length > 0) ||
    (trade.screenshots && (trade.screenshots.before || trade.screenshots.during || trade.screenshots.after))
  );
  checkField('screenshot', 'Screenshot', 'Screenshot', hasScreenshot, 'Chart verification screenshot before or after execution');

  // 2. Strategy Check
  const hasStrategy = Boolean(
    trade.strategy && 
    trade.strategy.trim().length > 0 && 
    trade.strategy.toLowerCase() !== 'none'
  );
  checkField('strategy', 'Strategy', 'Strategy', hasStrategy, 'Trading system or playbook model executed');

  // 3. Learning Check
  const hasLearning = Boolean(trade.learning && trade.learning.trim().length > 0);
  checkField('learning', 'Learning', 'Journal', hasLearning, 'Core rule, tactical insight, or takeaway for future trades');

  // 4. Mistake Check
  const hasMistake = Boolean(trade.mistake && trade.mistake.trim().length > 0);
  checkField('mistake', 'Mistake Analysis', 'Journal', hasMistake, 'Behavioral slip, execution flaw, or confirmation of clean execution');

  // 5. Notes Check
  const hasNotes = Boolean(trade.notes && trade.notes.trim().length > 0);
  checkField('notes', 'Notes', 'Journal', hasNotes, 'General market thesis, context, and confluence notes');

  // 6. Psychology & Emotions Check
  const hasEmotions = Boolean(
    (trade.emotions && trade.emotions.length > 0) || 
    (trade.duringEmotions && trade.duringEmotions.length > 0) ||
    trade.confidence !== undefined ||
    trade.exitEmotion
  );
  checkField('psychology', 'Psychology', 'Psychology', hasEmotions, 'Emotional state, mindset, or confidence score during execution');

  // 7. Session Check
  const hasSession = Boolean(trade.session && trade.session.trim().length > 0 && trade.session !== 'Other');
  checkField('session', 'Session', 'Strategy', hasSession, 'Market timing window (e.g., London, New York, Asian)');

  // 8. Timeframe Check
  const hasTimeframe = Boolean(trade.timeframe && trade.timeframe.trim().length > 0 && trade.timeframe !== 'Other');
  checkField('timeframe', 'Timeframe', 'Strategy', hasTimeframe, 'Primary chart interval (e.g. 5m, 15m, 1H)');

  // 9. Stop Loss Check
  const hasStopLoss = Boolean(trade.stopLoss !== undefined && trade.stopLoss !== null && Number(trade.stopLoss) > 0);
  checkField('stopLoss', 'Stop Loss', 'Risk', hasStopLoss, 'Planned structural stop loss for risk invalidation');

  // 10. Take Profit Check
  const hasTakeProfit = Boolean(trade.takeProfit !== undefined && trade.takeProfit !== null && Number(trade.takeProfit) > 0);
  checkField('takeProfit', 'Take Profit', 'Risk', hasTakeProfit, 'Planned target or profit level');

  // 11. Risk Amount Check
  const hasRisk = Boolean(
    (trade.risk !== undefined && trade.risk !== null && Number(trade.risk) > 0) ||
    (trade.riskPercent !== undefined && trade.riskPercent !== null && Number(trade.riskPercent) > 0)
  );
  checkField('risk', 'Risk Data', 'Risk', hasRisk, 'Dollar risk amount or percent of account capital risked');

  // 12. Trade Result Check
  const hasResult = Boolean(trade.result && trade.result.trim().length > 0);
  checkField('result', 'Result', 'Execution', hasResult, 'Final outcome (WIN, LOSS, BREAK EVEN, PENDING)');

  // 13. Exit Price Check
  const isTradeClosed = trade.result === 'WIN' || trade.result === 'LOSS' || trade.result === 'BREAK EVEN';
  const hasExitPrice = Boolean(trade.exitPrice !== undefined && trade.exitPrice !== null && Number(trade.exitPrice) > 0);
  
  if (isTradeClosed) {
    checkField('exitPrice', 'Exit Price', 'Execution', hasExitPrice, 'Actual realized execution exit price');
  }

  // Calculate percentage
  const totalEvaluated = completedItems.length + missingItems.length;
  const percentage = totalEvaluated > 0 ? Math.round((completedItems.length / totalEvaluated) * 100) : 100;

  // Determine Overall Status:
  // Complete: 100%
  // Partially Complete: 50% - 99%
  // Needs Review: < 50% OR missing critical outcome on a past trade
  let status: CompletionStatus = 'Complete';
  if (percentage < 100) {
    if (percentage >= 60 && hasResult && hasRisk) {
      status = 'Partially Complete';
    } else {
      status = 'Needs Review';
    }
  }

  // Section status breakdown for Trade Detail View
  const executionMissing: string[] = [];
  if (!trade.entry || Number(trade.entry) <= 0) executionMissing.push('Entry Price');
  if (isTradeClosed && !hasExitPrice) executionMissing.push('Exit Price');
  if (!hasResult) executionMissing.push('Result');

  const riskMissing: string[] = [];
  if (!hasStopLoss) riskMissing.push('Stop Loss');
  if (!hasTakeProfit) riskMissing.push('Take Profit');
  if (!hasRisk) riskMissing.push('Risk Amount');
  if (!trade.positionSize || Number(trade.positionSize) <= 0) riskMissing.push('Position Size');

  const strategyMissing: string[] = [];
  if (!hasStrategy) strategyMissing.push('Strategy Playbook');
  if (!hasSession) strategyMissing.push('Trading Session');
  if (!hasTimeframe) strategyMissing.push('Timeframe');

  return {
    status,
    percentage,
    missingItems,
    completedItems,
    hasMissingData: missingItems.length > 0,
    sections: {
      summary: {
        status: trade.market && trade.direction && trade.date ? 'Complete' : 'Missing',
        missingFields: [
          ...(!trade.market ? ['Market'] : []),
          ...(!trade.direction ? ['Direction'] : []),
          ...(!trade.date ? ['Date'] : [])
        ]
      },
      execution: {
        status: executionMissing.length === 0 ? 'Complete' : 'Missing',
        missingFields: executionMissing,
        description: !isTradeClosed ? 'Pending / Live trade (Exit Price N/A)' : undefined
      },
      risk: {
        status: riskMissing.length === 0 ? 'Complete' : 'Missing',
        missingFields: riskMissing
      },
      strategy: {
        status: strategyMissing.length === 0 ? 'Complete' : 'Missing',
        missingFields: strategyMissing
      },
      screenshot: {
        status: hasScreenshot ? 'Complete' : 'Missing',
        missingFields: hasScreenshot ? [] : ['Chart Screenshot']
      },
      psychology: {
        status: hasEmotions ? 'Complete' : 'Missing',
        missingFields: hasEmotions ? [] : ['Emotions / Mindset']
      },
      notes: {
        status: hasNotes ? 'Complete' : 'Missing',
        missingFields: hasNotes ? [] : ['Notes']
      },
      mistake: {
        status: hasMistake ? 'Complete' : 'Missing',
        missingFields: hasMistake ? [] : ['Mistake Analysis']
      },
      learning: {
        status: hasLearning ? 'Complete' : 'Missing',
        missingFields: hasLearning ? [] : ['Key Learning']
      }
    }
  };
}
