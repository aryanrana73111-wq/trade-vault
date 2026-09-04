import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { Trade, Strategy } from '../types';

interface DataContextType {
  trades: Trade[];
  strategies: Strategy[];
  loading: boolean;
  saveTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Trade>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  saveStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Strategy>;
  updateStrategy: (id: string, updates: Partial<Strategy>) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  resetDashboardData: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);

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
      return;
    }

    setLoading(true);

    const tradesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades');
    const strategiesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'strategies');

    const unsubTrades = onSnapshot(tradesRef, (snap) => {
      setTrades(snap.docs.map(d => d.data() as Trade));
      setLoading(false);
    }, (error) => {
      console.error("Trades listener error:", error);
      setLoading(false);
    });

    const unsubStrategies = onSnapshot(strategiesRef, (snap) => {
      setStrategies(snap.docs.map(d => d.data() as Strategy));
    }, (error) => {
      console.error("Strategies listener error:", error);
    });

    return () => {
      unsubTrades();
      unsubStrategies();
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

  const resetDashboardData = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before resetting dashboard data.');
    }
    if (!user || !activeDashboard) return;
    // Batch delete all trades and strategies for the current dashboard
    const tradesRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'trades');
    const stratsRef = collection(db, 'users', user.uid, 'dashboards', activeDashboard.id, 'strategies');
    
    const tradesSnap = await getDocs(tradesRef);
    const stratsSnap = await getDocs(stratsRef);
    
    const batch = writeBatch(db);
    tradesSnap.docs.forEach(d => batch.delete(d.ref));
    stratsSnap.docs.forEach(d => batch.delete(d.ref));
    
    await batch.commit();
  };

  return (
    <DataContext.Provider value={{
      trades,
      strategies,
      loading,
      saveTrade,
      updateTrade,
      deleteTrade,
      saveStrategy,
      updateStrategy,
      deleteStrategy,
      resetDashboardData
    }}>
      {children}
    </DataContext.Provider>
  );
};
