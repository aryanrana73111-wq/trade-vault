import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { CalculatorHistoryItem } from '@/types';

const LOCAL_STORAGE_KEY = 'tradevault_calculator_history';

// Helper to remove undefined values before writing to Firestore
const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(cleanUndefined);
  if (obj === null || typeof obj !== 'object') return obj;
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanUndefined(value);
    }
  }
  return cleaned;
};

export async function saveCalculatorHistoryItem(
  userId: string,
  dashboardId: string,
  itemData: Omit<CalculatorHistoryItem, 'id' | 'createdAt'>
): Promise<CalculatorHistoryItem> {
  const historyRef = collection(db, 'users', userId, 'dashboards', dashboardId, 'calculatorHistory');
  const newDoc = doc(historyRef);

  const item: CalculatorHistoryItem = {
    ...itemData,
    id: newDoc.id,
    createdAt: Date.now()
  };

  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await setDoc(newDoc, cleanUndefined(item));
    }
  } catch (error) {
    console.warn('Could not sync calculator history to cloud, persisting locally:', error);
  }

  // Always update local cache
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${dashboardId}`);
    const current: CalculatorHistoryItem[] = raw ? JSON.parse(raw) : [];
    const updated = [item, ...current.filter(i => i.id !== item.id)].slice(0, 50);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${dashboardId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Local storage write failed for calculator history', e);
  }

  return item;
}

export async function deleteCalculatorHistoryItem(
  userId: string,
  dashboardId: string,
  itemId: string
): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const docRef = doc(db, 'users', userId, 'dashboards', dashboardId, 'calculatorHistory', itemId);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Failed to delete history item from Firestore:', error);
  }

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${dashboardId}`);
    if (raw) {
      const current: CalculatorHistoryItem[] = JSON.parse(raw);
      const updated = current.filter(i => i.id !== itemId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${dashboardId}`, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Local storage delete failed for calculator history', e);
  }
}

export function subscribeToCalculatorHistory(
  userId: string,
  dashboardId: string,
  callback: (items: CalculatorHistoryItem[]) => void
): () => void {
  // Prime immediately with local cache for instant UI
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${dashboardId}`);
    if (raw) {
      callback(JSON.parse(raw));
    }
  } catch (e) {
    // Ignore cache parse error
  }

  const historyRef = collection(db, 'users', userId, 'dashboards', dashboardId, 'calculatorHistory');
  const q = query(historyRef, orderBy('createdAt', 'desc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const seen = new Set<string>();
      const items = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id } as CalculatorHistoryItem))
        .filter(i => {
          if (!i?.id || seen.has(i.id)) return false;
          seen.add(i.id);
          return true;
        });
      // Update local storage
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${dashboardId}`, JSON.stringify(items));
      } catch (e) {
        // Ignore quota error
      }
      callback(items);
    },
    (error) => {
      console.warn('Calculator history listener error, using local cache:', error);
    }
  );

  return unsubscribe;
}
