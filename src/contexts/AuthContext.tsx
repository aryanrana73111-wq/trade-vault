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
  isAdmin: boolean;
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

export const AuthContext = createContext<AuthContextType | null>(null);

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);

  // Helper with safe timeout for background network operations
  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
    ]);
  };

  useEffect(() => {
    // Safety timer: ensure loading state is released even if network is slow or offline
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer);
      setUser(firebaseUser);

      if (!firebaseUser) {
        setIsAdmin(false);
        setProfile(null);
        setDashboards([]);
        setActiveDashboard(null);
        setLoading(false);
        return;
      }

      // Check admin status immediately for bootstrap super admin
      const isBootstrapEmail = firebaseUser.email?.toLowerCase() === 'aryanrana73111@gmail.com';
      if (isBootstrapEmail) {
        setIsAdmin(true);
      }

      // 1. Instantly provide fallback profile & dashboard so UI renders with zero blank delay
      const initialProfile: UserProfile = {
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
      };
      setProfile((prev) => prev || initialProfile);

      const savedDashId = localStorage.getItem('tradevault_last_dashboard');
      const fallbackDash: Dashboard = {
        id: savedDashId || 'default-dash',
        name: 'My Trading Journal',
        currency: 'USD',
        startingBalance: 10000,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setActiveDashboard((prev) => prev || fallbackDash);
      setDashboards((prev) => (prev.length > 0 ? prev : [fallbackDash]));

      // 2. Immediately unblock the UI gate!
      setLoading(false);

      // 3. Asynchronously synchronize user metadata, profile, and dashboards in the background
      (async () => {
        setLoadingProfile(true);
        try {
          // Token claims check
          const tokenResult = await firebaseUser.getIdTokenResult().catch(() => null);
          const hasAdminClaim = tokenResult?.claims?.admin === true;

          let isDocAdmin = false;
          try {
            const adminDocSnap = await withTimeout(
              getDoc(doc(db, 'admins', firebaseUser.uid)),
              2500,
              null
            );
            if (adminDocSnap && adminDocSnap.exists()) {
              isDocAdmin = true;
            }
          } catch {}

          const userIsAdmin = hasAdminClaim || isBootstrapEmail || isDocAdmin;
          setIsAdmin(userIsAdmin);

          // Bootstrap admin sync
          if (isBootstrapEmail) {
            try {
              if (!isDocAdmin) {
                setDoc(doc(db, 'admins', firebaseUser.uid), {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  role: 'super_admin',
                  assignedAt: Date.now()
                }, { merge: true }).catch(() => {});
              }

              if (!hasAdminClaim) {
                const currentToken = await firebaseUser.getIdToken().catch(() => null);
                if (currentToken) {
                  fetch('/api/admin/verify', {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                  }).catch(() => {});
                }
              }
            } catch (e) {
              console.warn('Bootstrap admin sync notice:', e);
            }
          }

          // Top-level user record
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await withTimeout(getDoc(userRef), 2500, null);
          const userData = userSnap && userSnap.exists() ? userSnap.data() : null;

          if (userData?.status === 'DISABLED' && !userIsAdmin) {
            console.warn('Account disabled by administrator. Signing out user.');
            await firebaseSignOut(auth);
            setUser(null);
            setIsAdmin(false);
            setProfile(null);
            setDashboards([]);
            setActiveDashboard(null);
            return;
          }

          const userMetadata = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || userData?.name || 'Trader',
            photoURL: firebaseUser.photoURL || userData?.photoURL || '',
            provider: firebaseUser.providerData?.[0]?.providerId || 'password',
            emailVerified: firebaseUser.emailVerified === true,
            lastLoginAt: Date.now(),
            status: userData?.status || 'ACTIVE',
            createdAt: userData?.createdAt || Date.now(),
            updatedAt: Date.now()
          };

          setDoc(userRef, userMetadata, { merge: true }).catch(() => {});

          // Profile sync
          const profileRef = doc(db, 'users', firebaseUser.uid, 'profile', 'info');
          const profileSnap = await withTimeout(getDoc(profileRef), 2500, null);

          if (profileSnap && profileSnap.exists()) {
            setProfile(profileSnap.data() as UserProfile);
          } else {
            const hasExistingInfo = Boolean(userData?.name && userData.name !== 'Trader');
            const newProfile: UserProfile = {
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
            setDoc(profileRef, cleanUndefined(newProfile), { merge: true }).catch(() => {});
            setProfile(newProfile);
          }

          // Dashboards sync
          const dashRef = collection(db, 'users', firebaseUser.uid, 'dashboards');
          const q = query(dashRef, orderBy('createdAt', 'asc'));
          const snap = await withTimeout(getDocs(q), 3000, null);

          if (snap && !snap.empty) {
            const seen = new Set<string>();
            const loadedDashboards = snap.docs
              .map(d => ({ id: d.id, ...d.data() } as Dashboard))
              .filter(d => {
                if (!d?.id || seen.has(d.id)) return false;
                seen.add(d.id);
                return true;
              });

            if (loadedDashboards.length > 0) {
              setDashboards(loadedDashboards);
              const lastActiveId = localStorage.getItem('tradevault_last_dashboard');
              const lastActive = loadedDashboards.find(d => d.id === lastActiveId);
              setActiveDashboard(lastActive || loadedDashboards[0]);
            }
          } else {
            const newDashRef = doc(collection(db, 'users', firebaseUser.uid, 'dashboards'));
            const freshDash: Dashboard = {
              id: newDashRef.id,
              name: 'My Trading Journal',
              currency: 'USD',
              startingBalance: 10000,
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            setDoc(newDashRef, freshDash).catch(() => {});
            setDashboards([freshDash]);
            setActiveDashboard(freshDash);
            localStorage.setItem('tradevault_last_dashboard', freshDash.id);
          }
        } catch (error) {
          console.warn('Background profile sync notice:', error);
        } finally {
          setLoadingProfile(false);
        }
      })();
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 selection:bg-blue-600 selection:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold tracking-tight text-white font-sans">TradeVault</h2>
            <p className="text-xs text-slate-400 mt-1">Initializing trading environment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin,
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
      {children}
    </AuthContext.Provider>
  );
};

