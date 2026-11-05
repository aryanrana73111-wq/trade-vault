import { describe, it } from 'vitest';
import { normalizeDrawing, getLocalDrawings, saveLocalDrawings } from './chartDrawingsStore';
import { ChartDrawing } from '@/types';

// Mock localStorage for node environment
const storageMock: Record<string, string> = {};
global.localStorage = {
  getItem: (k: string) => storageMock[k] || null,
  setItem: (k: string, v: string) => { storageMock[k] = v; },
  removeItem: (k: string) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); },
  key: (i: number) => Object.keys(storageMock)[i] || null,
  length: 0
} as any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
  console.log(`✓ PASS: ${msg}`);
}

describe('Chart Drawings Store & Operations', () => {
  it('executes drawing assertions successfully', async () => {
  console.log('--- TRADEVAULT CHARTS PROMPT 3/5 DRAWINGS TESTS ---');

  const userId = 'usr_test_123';
  const dashboardId = 'dash_test_main';
  const symbol = 'BTC/USD';

  // 1. Create and Normalize a Trendline
  const trendline: ChartDrawing = normalizeDrawing({
    id: 'tl_1',
    type: 'trendline',
    symbol,
    points: [
      { time: 1700000000, price: 90000.5 },
      { time: 1700003600, price: 92500.0 }
    ],
    style: { color: '#3b82f6', lineWidth: 2, lineStyle: 'solid' }
  }, userId, dashboardId, symbol);

  assert(trendline.id === 'tl_1', 'Trendline preserved ID');
  assert(trendline.userId === userId, 'Trendline normalized userId');
  assert(trendline.dashboardId === dashboardId, 'Trendline normalized dashboardId');
  assert(trendline.points.length === 2, 'Trendline contains 2 valid points');
  assert(trendline.points[0].price === 90000.5, 'Trendline start point coordinate exact');
  assert(trendline.points[1].price === 92500.0, 'Trendline end point coordinate exact');
  assert(trendline.style.color === '#3b82f6', 'Trendline style color normalized');

  // 2. Create and Normalize a Horizontal Line
  const hline: ChartDrawing = normalizeDrawing({
    id: 'hl_1',
    type: 'horizontal',
    symbol,
    points: [{ time: 1700000000, price: 91000.0 }],
    style: { color: '#f59e0b', lineWidth: 2, lineStyle: 'solid' }
  }, userId, dashboardId, symbol);

  assert(hline.points.length === 1, 'Horizontal line contains 1 anchor level point');
  assert(hline.points[0].price === 91000.0, 'Horizontal line price coordinate exact');

  // 3. Create and Normalize a Rectangle
  const rect: ChartDrawing = normalizeDrawing({
    id: 'rect_1',
    type: 'rectangle',
    symbol,
    points: [
      { time: 1700000000, price: 89000.0 },
      { time: 1700007200, price: 91500.0 }
    ],
    style: { color: '#10b981', lineWidth: 2, lineStyle: 'dashed' }
  }, userId, dashboardId, symbol);

  assert(rect.points.length === 2, 'Rectangle contains 2 bounding points');
  assert(rect.style.lineStyle === 'dashed', 'Rectangle dashed style preserved');

  // 4. Save to Storage (Simulate Session Save)
  saveLocalDrawings(userId, dashboardId, symbol, [trendline, hline, rect]);
  assert(storageMock[`tradevault_chart_drawings_v2_${userId}_${dashboardId}_BTC_USD`] !== undefined, 'Drawings saved to storage under isolated key');

  // 5. Reload & Reopen
  const reloaded = getLocalDrawings(userId, dashboardId, symbol);
  assert(reloaded.length === 3, 'Reloaded exactly 3 drawings without loss or duplicates');
  assert(reloaded[0].type === 'trendline', 'Drawing 1 is trendline');
  assert(reloaded[1].type === 'horizontal', 'Drawing 2 is horizontal');
  assert(reloaded[2].type === 'rectangle', 'Drawing 3 is rectangle');
  assert(reloaded[0].points[1].price === 92500.0, 'Drawing 1 coordinates intact');

  // 6. Delete Horizontal Line and Save
  const afterDelete = reloaded.filter(d => d.id !== 'hl_1');
  assert(afterDelete.length === 2, 'Deleted horizontal line from active list');
  saveLocalDrawings(userId, dashboardId, symbol, afterDelete);

  const reloadedAfterDelete = getLocalDrawings(userId, dashboardId, symbol);
  assert(reloadedAfterDelete.length === 2, 'Storage persists deleted state across reload');
  assert(reloadedAfterDelete.find(d => d.id === 'hl_1') === undefined, 'Horizontal line is completely gone');

  // 7. Isolation Test: different user / dashboard receives empty
  const otherUser = getLocalDrawings('usr_other_456', dashboardId, symbol);
  assert(otherUser.length === 0, 'Drawings are strictly isolated by userId');

    console.log('--- ALL TEST ASSERTIONS PASSED SUCCESSFULLY ---');
  });
});
