import { Trade, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  TRADES: 'journal_trades',
  USER: 'journal_user',
  STRATEGIES: 'journal_strategies'
};

// Mock User Auth
export const getUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const loginUser = (email: string, name: string): User => {
  const user: User = { id: uuidv4(), email, name };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Trades Database
export const getTrades = (): Trade[] => {
  const trades = localStorage.getItem(STORAGE_KEYS.TRADES);
  return trades ? JSON.parse(trades) : [];
};

export const saveTrade = (tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Trade => {
  const user = getUser();
  if (!user) throw new Error('Not authenticated');

  const trades = getTrades();
  
  // Calculate RR Ratio
  let rrRatio = 0;
  if (tradeData.entry && tradeData.stopLoss && tradeData.takeProfit) {
    const risk = Math.abs(tradeData.entry - tradeData.stopLoss);
    const reward = Math.abs(tradeData.takeProfit - tradeData.entry);
    if (risk > 0) {
      rrRatio = reward / risk;
    }
  }

  const newTrade: Trade = {
    ...tradeData,
    id: uuidv4(),
    userId: user.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rrRatio,
  };

  trades.push(newTrade);
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  return newTrade;
};

export const updateTrade = (id: string, updates: Partial<Trade>): Trade => {
  const trades = getTrades();
  const index = trades.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trade not found');

  const updatedTrade = {
    ...trades[index],
    ...updates,
    updatedAt: Date.now(),
  };

  trades[index] = updatedTrade;
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  return updatedTrade;
};

export const deleteTrade = (id: string) => {
  const trades = getTrades();
  const filtered = trades.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(filtered));
};

// Strategies Database
import { Strategy } from '../types';

export const getStrategies = (): Strategy[] => {
  const strategies = localStorage.getItem(STORAGE_KEYS.STRATEGIES);
  return strategies ? JSON.parse(strategies) : [];
};

export const saveStrategy = (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Strategy => {
  const user = getUser();
  if (!user) throw new Error('Not authenticated');

  const strategies = getStrategies();
  
  const newStrategy: Strategy = {
    ...strategyData,
    id: uuidv4(),
    userId: user.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  strategies.push(newStrategy);
  localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(strategies));
  return newStrategy;
};

export const updateStrategy = (id: string, updates: Partial<Strategy>): Strategy => {
  const strategies = getStrategies();
  const index = strategies.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Strategy not found');

  const updatedStrategy = {
    ...strategies[index],
    ...updates,
    updatedAt: Date.now(),
  };

  strategies[index] = updatedStrategy;
  localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(strategies));
  return updatedStrategy;
};

export const deleteStrategy = (id: string) => {
  const strategies = getStrategies();
  const filtered = strategies.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(filtered));
};

// Seeding for preview
export const seedDemoData = () => {
  if (getTrades().length > 0) return;
  
  const user = getUser();
  if (!user) return;

  const demoTrades: Trade[] = [
    {
      id: uuidv4(),
      userId: user.id,
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
      date: Date.now() - 86400000 * 2,
      market: 'Gold',
      direction: 'BUY',
      entry: 2450.50,
      stopLoss: 2445.00,
      takeProfit: 2465.00,
      positionSize: 1.5,
      risk: 500,
      strategy: 'London Breakout',
      session: 'London',
      emotions: ['Calm', 'Confident'],
      notes: 'Clean break of Asian session highs.',
      mistake: 'None',
      learning: 'Patience pays off.',
      result: 'WIN',
      pnl: 1318.18, // ((2465 - 2450.5) / 2450.5) * something... let's just put mock values
      rrRatio: 2.63,
    },
    {
      id: uuidv4(),
      userId: user.id,
      createdAt: Date.now() - 86400000 * 1,
      updatedAt: Date.now() - 86400000 * 1,
      date: Date.now() - 86400000 * 1,
      market: 'Crypto',
      direction: 'SELL',
      entry: 64000,
      stopLoss: 65000,
      takeProfit: 60000,
      positionSize: 0.5,
      risk: 500,
      strategy: 'Trend Continuation',
      session: 'New York',
      emotions: ['FOMO'],
      notes: 'Chased the breakdown a bit too late.',
      mistake: 'Entered late, poor risk reward on entry.',
      learning: 'Wait for the retest.',
      result: 'LOSS',
      pnl: -500,
      rrRatio: 4,
    }
  ];

  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(demoTrades));
};
