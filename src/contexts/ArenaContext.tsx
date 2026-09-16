import React, { createContext, useContext, useState, useEffect } from 'react';
import { Arena } from '@/types';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface ArenaContextType {
  arenas: Arena[];
  loading: boolean;
  error: Error | null;
}

const ArenaContext = createContext<ArenaContextType | undefined>(undefined);

export function ArenaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setArenas([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'arenas'),
      where('memberIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const arenasData: Arena[] = [];
        snapshot.forEach((doc) => {
          arenasData.push({ ...(doc.data() as Arena), id: doc.id });
        });
        setArenas(arenasData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching arenas:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <ArenaContext.Provider value={{ arenas, loading, error }}>
      {children}
    </ArenaContext.Provider>
  );
}

export function useArena() {
  const context = useContext(ArenaContext);
  if (context === undefined) {
    throw new Error('useArena must be used within an ArenaProvider');
  }
  return context;
}
