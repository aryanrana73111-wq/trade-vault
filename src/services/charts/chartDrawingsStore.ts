import { ChartDrawing, ChartDrawingStyle } from '@/types';
import { db, auth } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';

const LOCAL_STORAGE_PREFIX = 'tradevault_chart_drawings_v2_';

/**
 * Normalizes a drawing to ensure strict compliance with the normalized ChartDrawing model
 */
export function normalizeDrawing(raw: any, fallbackUserId = '', fallbackDashboardId = '', fallbackSymbol = ''): ChartDrawing {
  const points = Array.isArray(raw.points)
    ? raw.points.map((p: any) => ({
        time: Number(p.time) || Math.floor(Date.now() / 1000),
        price: Number(p.price) || 0,
      }))
    : [];

  const style: ChartDrawingStyle = {
    color: raw.style?.color || raw.color || '#3b82f6',
    lineWidth: raw.style?.lineWidth || raw.lineWidth || 2,
    lineStyle: raw.style?.lineStyle || raw.lineStyle || 'solid',
    fillColor: raw.style?.fillColor || raw.fillColor || undefined,
    fontSize: raw.style?.fontSize || raw.fontSize || 12,
  };

  return {
    id: String(raw.id || `drawing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    userId: String(raw.userId || fallbackUserId),
    dashboardId: String(raw.dashboardId || fallbackDashboardId),
    symbol: String(raw.symbol || fallbackSymbol),
    timeframe: raw.timeframe || undefined,
    type: String(raw.type || 'trendline'),
    points,
    style,
    color: style.color,
    lineWidth: style.lineWidth,
    lineStyle: style.lineStyle,
    text: raw.text !== undefined ? String(raw.text) : undefined,
    entryPrice: raw.entryPrice !== undefined ? Number(raw.entryPrice) : undefined,
    stopLoss: raw.stopLoss !== undefined ? Number(raw.stopLoss) : undefined,
    takeProfit: raw.takeProfit !== undefined ? Number(raw.takeProfit) : undefined,
    riskReward: raw.riskReward !== undefined ? Number(raw.riskReward) : undefined,
    filled: raw.filled !== undefined ? Boolean(raw.filled) : true,
    isLocked: Boolean(raw.isLocked),
    createdAt: Number(raw.createdAt) || Date.now(),
    updatedAt: Number(raw.updatedAt) || Date.now(),
  };
}

/**
 * Local cache read
 */
export function getLocalDrawings(userId: string, dashboardId: string, symbol: string): ChartDrawing[] {
  if (!userId || !dashboardId || !symbol) return [];
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}_${dashboardId}_${symbol.replace(/[/^=]/g, '_')}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((d: any) => normalizeDrawing(d, userId, dashboardId, symbol));
    }
    return [];
  } catch (err) {
    console.warn('Failed to load local drawings:', err);
    return [];
  }
}

/**
 * Local cache write
 */
export function saveLocalDrawings(userId: string, dashboardId: string, symbol: string, drawings: ChartDrawing[]): void {
  if (!userId || !dashboardId || !symbol) return;
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}_${dashboardId}_${symbol.replace(/[/^=]/g, '_')}`;
    localStorage.setItem(key, JSON.stringify(drawings));
  } catch (err) {
    console.warn('Failed to save local drawings:', err);
  }
}

/**
 * Sync drawings to Firestore for authenticated user / dashboard isolation
 */
export async function syncDrawingsToFirestore(
  userId: string,
  dashboardId: string,
  symbol: string,
  drawings: ChartDrawing[]
): Promise<void> {
  // Validate caller identity to prevent spoofing
  if (!userId || !dashboardId || !symbol) return;
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || currentAuthUser.uid !== userId) {
    console.warn('Security: syncDrawingsToFirestore blocked unauthorized userId mutation.');
    return;
  }

  // Normalize drawings before storage
  const normalized = drawings.map((d) => normalizeDrawing(d, userId, dashboardId, symbol));

  // Save locally first for instant snappy responsiveness
  saveLocalDrawings(userId, dashboardId, symbol, normalized);

  try {
    const symbolDocKey = symbol.replace(/[/^=]/g, '_');
    const drawingsRef = collection(db, 'users', userId, 'dashboards', dashboardId, 'chart_drawings');
    const symbolDoc = doc(drawingsRef, symbolDocKey);

    await setDoc(symbolDoc, {
      symbol,
      userId,
      dashboardId,
      updatedAt: Date.now(),
      drawings: normalized.map((d) => ({
        id: d.id,
        userId: d.userId,
        dashboardId: d.dashboardId,
        symbol: d.symbol,
        timeframe: d.timeframe || '',
        type: d.type,
        points: d.points,
        style: d.style,
        color: d.style.color || '#3b82f6',
        lineWidth: d.style.lineWidth || 2,
        lineStyle: d.style.lineStyle || 'solid',
        text: d.text || '',
        entryPrice: d.entryPrice || 0,
        stopLoss: d.stopLoss || 0,
        takeProfit: d.takeProfit || 0,
        riskReward: d.riskReward || 0,
        filled: !!d.filled,
        isLocked: !!d.isLocked,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (err) {
    console.warn('Firestore drawings sync notice:', err);
  }
}

/**
 * Load drawings from Firestore with local fallback
 */
export async function loadDrawingsForSymbol(
  userId: string,
  dashboardId: string,
  symbol: string
): Promise<ChartDrawing[]> {
  const local = getLocalDrawings(userId, dashboardId, symbol);

  if (!userId || !dashboardId || !symbol) {
    return local;
  }

  // Prevent cross-user access
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || currentAuthUser.uid !== userId) {
    return local;
  }

  try {
    const symbolDocKey = symbol.replace(/[/^=]/g, '_');
    const symbolDocRef = doc(db, 'users', userId, 'dashboards', dashboardId, 'chart_drawings', symbolDocKey);
    const snap = await getDoc(symbolDocRef);

    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.drawings)) {
        const normalized = data.drawings.map((d: any) => normalizeDrawing(d, userId, dashboardId, symbol));
        saveLocalDrawings(userId, dashboardId, symbol, normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('Firestore drawings load notice:', err);
  }

  return local;
}
