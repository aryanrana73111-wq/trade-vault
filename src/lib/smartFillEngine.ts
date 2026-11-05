import { calculateRiskAmountFromLot, calculateRealizedPnlFromExit, calculateSuggestedResultPnl } from './instrumentSpecs';
import { FieldSource } from '../components/common/FieldSourceIndicator';

export interface SmartFillFormState {
  market: string;
  direction: 'BUY' | 'SELL';
  entry: string;
  stopLoss: string;
  takeProfit: string;
  positionSize: string;
  risk: string;
  exitPrice?: string;
  result?: string;
  pnl?: string;
  quickResultMode?: boolean;
  fieldSources?: Record<string, FieldSource>;
}

export interface SmartFillResult {
  suggestedRisk?: string;
  suggestedPnl?: string;
  suggestedExit?: string;
  rrRatio?: number;
  updatedFieldSources: Record<string, FieldSource>;
  filledCount: number;
  manualFieldsNeededCount: number;
  specWarning?: string;
}

/**
 * Runs rule-based smart calculations over current form state
 */
export function runSmartFill(form: SmartFillFormState): SmartFillResult {
  const sources: Record<string, FieldSource> = { ...(form.fieldSources || {}) };
  let filledCount = 0;
  let suggestedRisk: string | undefined = undefined;
  let suggestedPnl: string | undefined = undefined;
  let specWarning: string | undefined = undefined;

  const entryNum = parseFloat(form.entry);
  const slNum = parseFloat(form.stopLoss);
  const tpNum = parseFloat(form.takeProfit);
  const lotNum = parseFloat(form.positionSize);
  const exitNum = form.exitPrice ? parseFloat(form.exitPrice) : undefined;
  const riskNum = form.risk ? parseFloat(form.risk) : undefined;

  // 1. Calculate Risk Amount from Entry + SL + Lot + Market Specs
  if (form.market && entryNum > 0 && slNum > 0 && lotNum > 0) {
    const riskCalc = calculateRiskAmountFromLot({
      market: form.market,
      entry: entryNum,
      stopLoss: slNum,
      lot: lotNum,
      direction: form.direction
    });

    if (riskCalc.calculable && riskCalc.riskAmount !== undefined) {
      suggestedRisk = riskCalc.riskAmount.toString();
      if (!form.risk || sources.risk === 'auto_calculated') {
        sources.risk = 'auto_calculated';
        filledCount++;
      }
    } else if (riskCalc.reason) {
      specWarning = riskCalc.reason;
    }
  }

  // 2. Calculate Realized P&L from Entry + Exit + Lot + Market Specs
  if (form.market && entryNum > 0 && exitNum && exitNum > 0 && lotNum > 0) {
    const pnlCalc = calculateRealizedPnlFromExit({
      market: form.market,
      entry: entryNum,
      exit: exitNum,
      lot: lotNum,
      direction: form.direction
    });

    if (pnlCalc.calculable && pnlCalc.pnl !== undefined) {
      suggestedPnl = pnlCalc.pnl.toString();
      if (!form.pnl || sources.pnl === 'auto_calculated') {
        sources.pnl = 'auto_calculated';
        filledCount++;
      }
    }
  } else if (form.result && form.quickResultMode && (riskNum || (suggestedRisk && parseFloat(suggestedRisk) > 0))) {
    // 3. Quick Result Mode (1R shortcut)
    const activeRisk = riskNum || parseFloat(suggestedRisk || '0');
    const resultCalc = calculateSuggestedResultPnl({
      result: form.result as any,
      riskAmount: activeRisk,
      quickResultMode: true
    });

    if (resultCalc.pnl !== null) {
      suggestedPnl = resultCalc.pnl.toString();
      sources.pnl = 'quick_result_1r';
      filledCount++;
    }
  }

  // 4. Calculate RR Ratio
  let rrRatio: number | undefined = undefined;
  if (entryNum > 0 && slNum > 0 && tpNum > 0) {
    const riskDist = Math.abs(entryNum - slNum);
    const rewDist = Math.abs(tpNum - entryNum);
    if (riskDist > 0) {
      rrRatio = Number((rewDist / riskDist).toFixed(2));
    }
  }

  // Count fields still needing manual input
  let manualNeeded = 0;
  if (!form.market) manualNeeded++;
  if (!form.entry) manualNeeded++;
  if (!form.positionSize) manualNeeded++;
  if (!form.stopLoss) manualNeeded++;

  return {
    suggestedRisk,
    suggestedPnl,
    rrRatio,
    updatedFieldSources: sources,
    filledCount,
    manualFieldsNeededCount: manualNeeded,
    specWarning
  };
}
