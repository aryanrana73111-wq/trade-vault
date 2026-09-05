import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { Trade, Strategy, LearningEntry, TradingRule } from '../types';

interface DataContextType {
  trades: Trade[];
  strategies: Strategy[];
  learnings: LearningEntry[];
  rules: TradingRule[];
  loading: boolean;
  saveTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Trade>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  saveStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Strategy>;
  updateStrategy: (id: string, updates: Partial<Strategy>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  saveLearning: (learning: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'>) => Promise<LearningEntry>;
  updateLearning: (id: string, updates: Partial<LearningEntry>) => Promise<void>;
  deleteLearning: (id: string) => Promise<void>;
  saveRule: (rule: Omit<TradingRule, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'>) => Promise<TradingRule>;
  updateRule: (id: string, updates: Partial<TradingRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  reorderRules: (orderedRulesOrIds: TradingRule[] | string[]) => Promise<void>;
  resetDashboardData: () => Promise<void>;
  deleteAllTradeData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, activeDashboard } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [learnings, setLearnings] = useState<LearningEntry[]>([]);
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to deduplicate array by id
  const dedupById = <T extends { id: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      if (!item?.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  // Helper to remove undefined values before saving to Firestore
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

  useEffect(() => {
    if (!user || !activeDashboard) {
      setTrades([]);
      setStrategies([]);
      setLearnings([]);
      setRules([]);
      return;
    }

    setLoading(true);

    const tradesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades');
    const strategiesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'strategies');
    const learningsRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'learnings');
    const rulesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'rules');

    const unsubTrades = onSnapshot(tradesRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Trade));
      setTrades(dedupById(items));
      setLoading(false);
    }, (error) => {
      console.error("Trades listener error:", error);
      setLoading(false);
    });

    const unsubStrategies = onSnapshot(strategiesRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Strategy));
      setStrategies(dedupById(items));
    }, (error) => {
      console.error("Strategies listener error:", error);
    });

    const unsubLearnings = onSnapshot(learningsRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as LearningEntry));
      const unique = dedupById(items);
      // Sort newest date first by default
      setLearnings(unique.sort((a, b) => (b.date || b.createdAt) - (a.date || a.createdAt)));
    }, (error) => {
      console.error("Learnings listener error:", error);
    });

    const unsubRules = onSnapshot(rulesRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as TradingRule));
      const unique = dedupById(items);
      // Sort by order asc, then pinned first
      setRules(unique.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (a.order ?? 0) - (b.order ?? 0);
      }));
    }, (error) => {
      console.error("Rules listener error:", error);
    });

    return () => {
      unsubTrades();
      unsubStrategies();
      unsubLearnings();
      unsubRules();
    };
  }, [user, activeDashboard]);

  const saveTrade = async (tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving this trade.');
    }
    if (!user || !activeDashboard) throw new Error('No active dashboard');
    
    // Calculate rrRatio properly
    let rrRatio;
    const risk = Math.abs(tradeData.entry - tradeData.stopLoss);
    const reward = Math.abs(tradeData.takeProfit - tradeData.entry);
    if (risk > 0) {
      rrRatio = reward / risk;
    }

    const tradesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades');
    const newDoc = doc(tradesRef);
    
    const trade: Trade = {
      ...tradeData,
      id: newDoc.id,
      userId: user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rrRatio,
    };

    await setDoc(newDoc, cleanUndefined(trade));
    return trade;
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving this trade.');
    }
    if (!user || !activeDashboard) return;
    const tradeRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades', id);
    await setDoc(tradeRef, cleanUndefined({ ...updates, updatedAt: Date.now() }), { merge: true });
  };

  const deleteTrade = async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting this trade.');
    }
    if (!user || !activeDashboard) return;
    const tradeRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades', id);
    await deleteDoc(tradeRef);
  };

  const saveStrategy = async (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving this strategy.');
    }
    if (!user || !activeDashboard) throw new Error('No active dashboard');
    const strategiesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'strategies');
    const newDoc = doc(strategiesRef);
    
    const strategy: Strategy = {
      ...strategyData,
      id: newDoc.id,
      userId: user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(newDoc, cleanUndefined(strategy));
    return strategy;
  };

  const updateStrategy = async (id: string, updates: Partial<Strategy>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving this strategy.');
    }
    if (!user || !activeDashboard) return;
    const strategyRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'strategies', id);
    await setDoc(strategyRef, cleanUndefined({ ...updates, updatedAt: Date.now() }), { merge: true });
  };

  const deleteStrategy = async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting this strategy.');
    }
    if (!user || !activeDashboard) return;
    const strategyRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'strategies', id);
    await deleteDoc(strategyRef);
  };

  const saveLearning = async (learningData: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving learning.');
    }
    if (!user || !activeDashboard) throw new Error('No active dashboard');
    const learningsRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'learnings');
    const newDoc = doc(learningsRef);

    const learning: LearningEntry = {
      ...learningData,
      id: newDoc.id,
      userId: user.uid,
      dashboardId: activeDashboard.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(newDoc, cleanUndefined(learning));
    setLearnings(prev => dedupById([learning, ...prev.filter(l => l.id !== learning.id)]));
    return learning;
  };

  const updateLearning = async (id: string, updates: Partial<LearningEntry>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving learning.');
    }
    if (!user || !activeDashboard) return;
    const learningRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'learnings', id);
    await setDoc(learningRef, cleanUndefined({ ...updates, updatedAt: Date.now() }), { merge: true });
    setLearnings(prev => dedupById(prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: Date.now() } : l)));
  };

  const deleteLearning = async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting learning.');
    }
    if (!user || !activeDashboard) return;
    const learningRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'learnings', id);
    await deleteDoc(learningRef);
    setLearnings(prev => prev.filter(l => l.id !== id));
  };

  const saveRule = async (ruleData: Omit<TradingRule, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before saving rule.');
    }
    if (!user || !activeDashboard) throw new Error('No active dashboard');
    const rulesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'rules');
    const newDoc = doc(rulesRef);

    const rule: TradingRule = {
      ...ruleData,
      id: newDoc.id,
      userId: user.uid,
      dashboardId: activeDashboard.id,
      order: ruleData.order !== undefined ? ruleData.order : rules.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(newDoc, cleanUndefined(rule));
    setRules(prev => dedupById([...prev.filter(r => r.id !== rule.id), rule]));
    return rule;
  };

  const updateRule = async (id: string, updates: Partial<TradingRule>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before updating rule.');
    }
    if (!user || !activeDashboard) return;
    const ruleRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'rules', id);
    await setDoc(ruleRef, cleanUndefined({ ...updates, updatedAt: Date.now() }), { merge: true });
    setRules(prev => dedupById(prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r)));
  };

  const deleteRule = async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting rule.');
    }
    if (!user || !activeDashboard) return;
    const ruleRef = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'rules', id);
    await deleteDoc(ruleRef);
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const reorderRules = async (orderedRulesOrIds: TradingRule[] | string[]) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before reordering rules.');
    }
    if (!user || !activeDashboard) return;

    const ids: string[] = orderedRulesOrIds.map((item) =>
      typeof item === 'string' ? item : item.id
    );

    // Optimistically reorder local state
    setRules((prev) => {
      const map = new Map<string, TradingRule>(prev.map((r) => [r.id, r]));
      const nextList: TradingRule[] = [];
      const handled = new Set<string>();
      ids.forEach((id, index) => {
        const item = map.get(id);
        if (item) {
          nextList.push({ ...item, order: index });
          handled.add(id);
        }
      });
      prev.forEach(r => {
        if (!handled.has(r.id)) nextList.push(r);
      });
      return dedupById(nextList);
    });

    const batch = writeBatch(db);
    ids.forEach((id, index) => {
      const ref = doc(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'rules', id);
      batch.update(ref, { order: index, updatedAt: Date.now() });
    });
    await batch.commit();
  };

  const deleteAllTradeData = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting trade data.');
    }
    if (!user || !activeDashboard) throw new Error('No active dashboard selected');

    // Query all trades belonging to the currently selected dashboard only
    const tradesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades');
    const tradesSnap = await getDocs(tradesRef);
    
    // Chunk deletion into batches of 400 to strictly respect Firestore's 500-write limit
    const BATCH_SIZE = 400;
    for (let i = 0; i < tradesSnap.docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = tradesSnap.docs.slice(i, i + BATCH_SIZE);
      chunk.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    // Immediately update local state so UI, KPIs, Journal, and Analytics clear instantly
    setTrades([]);
  };

  const resetDashboardData = async () => {
    // Alias for deleteAllTradeData ensuring strategies are NOT deleted
    await deleteAllTradeData();
  };

  return (
    <DataContext.Provider value={{
      trades,
      strategies,
      learnings,
      rules,
      loading,
      saveTrade,
      updateTrade,
      deleteTrade,
      saveStrategy,
      updateStrategy,
      deleteStrategy,
      saveLearning,
      updateLearning,
      deleteLearning,
      saveRule,
      updateRule,
      deleteRule,
      reorderRules,
      resetDashboardData,
      deleteAllTradeData
    }}>
      {children}
    </DataContext.Provider>
  );
};
