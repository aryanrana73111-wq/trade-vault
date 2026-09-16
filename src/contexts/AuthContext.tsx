import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  deleteUser
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { UserProfile, Dashboard } from '@/types';
import { uploadAvatarFile } from '@/lib/avatarStorage';
import { logSecurityEvent } from '@/lib/securityService';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  profile: UserProfile | null;
  loadingProfile: boolean;
  activeDashboard: Dashboard | null;
  dashboards: Dashboard[];
  setActiveDashboard: (d: Dashboard | null) => void;
  createDashboard: (name: string, currency: string, balance: number) => Promise<Dashboard>;
  deleteDashboard: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Helper to remove undefined values before Firestore operations
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoadingProfile(true);
        try {
          // Ensure top-level user doc exists
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'Trader',
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          }

          // Load or initialize user profile document under users/{uid}/profile/info
          const profileRef = doc(db, 'users', firebaseUser.uid, 'profile', 'info');
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const loadedProfile = profileSnap.data() as UserProfile;
            setProfile(loadedProfile);
          } else {
            // Check if this is an existing user who already had data/name
            const hasExistingInfo = Boolean(userData?.name && userData.name !== 'Trader');
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || userData?.name || 'Trader',
              email: firebaseUser.email || '',
              tradingStyle: userData?.tradingStyle || 'Day Trading',
              tradingExperience: userData?.tradingExperience || '',
              preferredMarkets: userData?.preferredMarkets || '',
              preferredTradingSession: userData?.preferredTradingSession || '',
              defaultAccountType: userData?.defaultAccountType || 'Personal Live',
              bio: userData?.bio || '',
              avatarUrl: userData?.avatarUrl || firebaseUser.photoURL || '',
              onboardingCompleted: hasExistingInfo || Boolean(userData?.onboardingCompleted),
              createdAt: Date.now(),
              updatedAt: Date.now()
            };

            await setDoc(profileRef, cleanUndefined(initialProfile));
            setProfile(initialProfile);
          }

          // Load dashboards
          const dashRef = collection(db, 'users', firebaseUser.uid, 'dashboards');
          const q = query(dashRef, orderBy('createdAt', 'asc'));
          const snap = await getDocs(q);
          const seen = new Set<string>();
          const loadedDashboards = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Dashboard))
            .filter(d => {
              if (!d?.id || seen.has(d.id)) return false;
              seen.add(d.id);
              return true;
            });
          
          setDashboards(loadedDashboards);

          if (loadedDashboards.length > 0) {
            // Check localstorage for last active dashboard
            const lastActiveId = localStorage.getItem('tradevault_last_dashboard');
            const lastActive = loadedDashboards.find(d => d.id === lastActiveId);
            setActiveDashboard(lastActive || loadedDashboards[0]);
          } else {
            // Create default dashboard
            const newDashRef = doc(collection(db, 'users', firebaseUser.uid, 'dashboards'));
            const defaultDash: Dashboard = {
              id: newDashRef.id,
              name: 'My Trading Journal',
              currency: 'USD',
              startingBalance: 10000,
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            await setDoc(newDashRef, defaultDash);
            setDashboards([defaultDash]);
            setActiveDashboard(defaultDash);
          }
        } catch (error) {
          console.warn('Firestore initial data fetch encountered connection issue; initializing fallback profile:', error);
          // Fallback profile if offline/unavailable so UI remains responsive
          setProfile((prev) => prev || {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || 'Trader',
            email: firebaseUser.email || '',
            tradingStyle: 'Day Trading',
            tradingExperience: '',
            preferredMarkets: '',
            preferredTradingSession: '',
            defaultAccountType: 'Personal Live',
            bio: '',
            avatarUrl: firebaseUser.photoURL || '',
            onboardingCompleted: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          const fallbackDash: Dashboard = {
            id: 'default-dash',
            name: 'My Trading Journal',
            currency: 'USD',
            startingBalance: 10000,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          setDashboards((prev) => prev.length > 0 ? prev : [fallbackDash]);
          setActiveDashboard((prev) => prev || fallbackDash);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setProfile(null);
        setDashboards([]);
        setActiveDashboard(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before updating your profile.');
    }
    if (!user) throw new Error('Not authenticated');

    const profileRef = doc(db, 'users', user.uid, 'profile', 'info');
    const userRef = doc(db, 'users', user.uid);

    const updatedData = {
      ...updates,
      updatedAt: Date.now()
    };

    await setDoc(profileRef, cleanUndefined(updatedData), { merge: true });

    // Sync display name and avatarUrl to user doc
    const userSyncData: Record<string, any> = { updatedAt: Date.now() };
    if (updates.fullName !== undefined) userSyncData.name = updates.fullName;
    if (updates.avatarUrl !== undefined) userSyncData.avatarUrl = updates.avatarUrl;

    if (Object.keys(userSyncData).length > 1) {
      await setDoc(userRef, cleanUndefined(userSyncData), { merge: true });
    }

    setProfile(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const { url } = await uploadAvatarFile(user.uid, file);
    await updateProfile({ avatarUrl: url });
    return url;
  };

  const removeAvatar = async () => {
    if (!user) throw new Error('Not authenticated');
    await updateProfile({ avatarUrl: '' });
  };

  const createDashboard = async (name: string, currency: string, balance: number) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before creating a dashboard.');
    }
    if (!user) throw new Error('Not authenticated');
    const newDashRef = doc(collection(db, 'users', user.uid, 'dashboards'));
    const dash: Dashboard = {
      id: newDashRef.id,
      name,
      currency,
      startingBalance: balance,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await setDoc(newDashRef, dash);
    setDashboards(prev => [...prev.filter(d => d.id !== dash.id), dash]);
    return dash;
  };

  const deleteDashboard = async (id: string) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting dashboard.');
    }
    if (!user) throw new Error('Not authenticated');

    const dashRef = doc(db, 'users', user.uid, 'dashboards', id);

    // 1. Delete all trades belonging to this dashboard in batches
    const tradesRef = collection(db, 'users', user.uid, 'dashboards', id, 'trades');
    const tradesSnap = await getDocs(tradesRef);
    const BATCH_SIZE = 400;
    
    for (let i = 0; i < tradesSnap.docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = tradesSnap.docs.slice(i, i + BATCH_SIZE);
      chunk.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    // 2. Delete all strategies belonging to this dashboard in batches
    const stratsRef = collection(db, 'users', user.uid, 'dashboards', id, 'strategies');
    const stratsSnap = await getDocs(stratsRef);
    for (let i = 0; i < stratsSnap.docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = stratsSnap.docs.slice(i, i + BATCH_SIZE);
      chunk.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }

    // 3. Delete the dashboard document itself in Firestore
    await deleteDoc(dashRef);

    // 4. Update state and handle active dashboard switch
    const remaining = dashboards.filter(d => d.id !== id);
    setDashboards(remaining);

    if (activeDashboard?.id === id) {
      if (remaining.length > 0) {
        setActiveDashboard(remaining[0]);
        localStorage.setItem('tradevault_last_dashboard', remaining[0].id);
      } else {
        // Create a new default dashboard if none remain
        const newDashRef = doc(collection(db, 'users', user.uid, 'dashboards'));
        const defaultDash: Dashboard = {
          id: newDashRef.id,
          name: 'My Trading Journal',
          currency: 'USD',
          startingBalance: 10000,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(newDashRef, defaultDash);
        setDashboards([defaultDash]);
        setActiveDashboard(defaultDash);
        localStorage.setItem('tradevault_last_dashboard', defaultDash.id);
      }
    }
  };

  const handleSetActive = (d: Dashboard | null) => {
    setActiveDashboard(d);
    if (d) {
      localStorage.setItem('tradevault_last_dashboard', d.id);
    } else {
      localStorage.removeItem('tradevault_last_dashboard');
    }
  };

  const logout = async () => {
    if (user) {
      await logSecurityEvent(user.uid, {
        action: 'AUTH_LOGOUT',
        title: 'User Sign Out',
        description: `Session signed out from ${user.email || 'User'}.`,
        status: 'success'
      });
    }
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are currently offline. Please reconnect before deleting your account.');
    }
    if (!user) throw new Error('Not authenticated');
    const uid = user.uid;

    try {
      await logSecurityEvent(uid, {
        action: 'ACCOUNT_DELETION_ATTEMPTED',
        title: 'Permanent Account Purge',
        description: `Full account and data wipe requested for ${user.email}.`,
        status: 'warning'
      });
    } catch {}

    // 1. Delete each dashboard and all subcollections
    for (const d of dashboards) {
      const subcollections = ['trades', 'strategies', 'learnings', 'rules', 'calculatorHistory'];
      for (const sub of subcollections) {
        try {
          const subRef = collection(db, 'users', uid, 'dashboards', d.id, sub);
          const snap = await getDocs(subRef);
          const BATCH_SIZE = 400;
          for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            snap.docs.slice(i, i + BATCH_SIZE).forEach(docItem => batch.delete(docItem.ref));
            await batch.commit();
          }
        } catch (e) {
          console.warn(`Error deleting subcollection ${sub} for dashboard ${d.id}:`, e);
        }
      }
      try {
        await deleteDoc(doc(db, 'users', uid, 'dashboards', d.id));
      } catch (e) {}
    }

    // 2. Delete newsSettings and auditLogs subcollections
    const otherSubcollections = ['newsSettings', 'auditLogs'];
    for (const sub of otherSubcollections) {
      try {
        const subRef = collection(db, 'users', uid, sub);
        const snap = await getDocs(subRef);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      } catch (e) {}
    }

    // 3. Delete profile and academy docs
    try { await deleteDoc(doc(db, 'users', uid, 'profile', 'info')); } catch {}
    try { await deleteDoc(doc(db, 'users', uid, 'academy', 'profile')); } catch {}

    // 4. Delete top-level user doc
    try { await deleteDoc(doc(db, 'users', uid)); } catch {}

    // 5. Clear local storage caches
    localStorage.removeItem('tradevault_last_dashboard');
    localStorage.removeItem('tradevault_academy_progress');
    localStorage.removeItem(`tradevault_audit_logs_${uid}`);

    // 6. Delete Firebase Auth user account
    await deleteUser(user);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      profile,
      loadingProfile,
      activeDashboard, 
      dashboards, 
      setActiveDashboard: handleSetActive, 
      createDashboard,
      deleteDashboard,
      updateProfile,
      uploadAvatar,
      removeAvatar,
      logout,
      deleteAccount
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

