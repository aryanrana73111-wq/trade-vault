import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot
} from 'firebase/firestore';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  googleUsers: number;
  passwordUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  activityWindowDays?: number;
  recentUsers?: AdminUserListItem[];
}

export interface AdminUserListItem {
  uid: string;
  id: string;
  name: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: string;
  createdAt: number;
  lastLoginAt: number;
  emailVerified: boolean;
  status: 'ACTIVE' | 'DISABLED';
}

export interface AdminTradingSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  totalPnl: number;
  recentTrades: {
    id: string;
    market: string;
    direction: string;
    date: number;
    result: string;
    pnl: number;
  }[];
}

export interface AdminUserDetail extends AdminUserListItem {
  tradingStyle?: string;
  preferredMarkets?: string;
  bio?: string;
  tradingSummary: AdminTradingSummary;
}

export interface AdminAuditLogEntry {
  id: string;
  adminEmail?: string;
  adminUid?: string;
  action: string;
  event?: string;
  userEmail?: string;
  userName?: string;
  targetUid?: string;
  targetEmail?: string;
  relatedObject?: string;
  details?: Record<string, any>;
  timestamp: number;
}

const BOOTSTRAP_ADMIN_EMAIL = 'aryanrana73111@gmail.com';

export const adminService = {
  /**
   * Verify if the currently authenticated user has administrator authorization
   */
  async verifyAdminSession(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      // 1. Email bootstrap check
      if (currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
        return true;
      }

      // 2. Custom claims check
      const tokenResult = await currentUser.getIdTokenResult().catch(() => null);
      if (tokenResult?.claims?.admin === true) {
        return true;
      }

      // 3. Firestore admins collection record
      const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid)).catch(() => null);
      if (adminSnap?.exists()) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  /**
   * Calculate real KPI statistics from real Firestore user documents
   */
  async getStats(): Promise<AdminStats> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const docs = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const now = Date.now();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayTs = startOfToday.getTime();

      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

      // Active User definition: user with login or update activity within 30-day window
      const activityWindowDays = 30;
      const activityCutoff = now - activityWindowDays * 24 * 60 * 60 * 1000;

      const totalUsers = docs.length;
      const activeUsers = docs.filter((u: any) => 
        u.status !== 'DISABLED' && (
          (u.lastLoginAt && typeof u.lastLoginAt === 'number' && u.lastLoginAt >= activityCutoff) ||
          (u.updatedAt && typeof u.updatedAt === 'number' && u.updatedAt >= activityCutoff) ||
          (u.createdAt && typeof u.createdAt === 'number' && u.createdAt >= activityCutoff)
        )
      ).length;
      const disabledUsers = docs.filter((u: any) => u.status === 'DISABLED').length;

      // New users today: actual account creation timestamp within today's date boundaries
      const newUsersToday = docs.filter((u: any) => (u.createdAt || 0) >= startOfTodayTs).length;
      const newUsersThisWeek = docs.filter((u: any) => (u.createdAt || 0) >= oneWeekAgo).length;
      const newUsersThisMonth = docs.filter((u: any) => (u.createdAt || 0) >= oneMonthAgo).length;

      const googleUsers = docs.filter((u: any) => 
        u.provider === 'google.com' || (u.providerId && String(u.providerId).includes('google'))
      ).length;
      const passwordUsers = docs.filter((u: any) => 
        u.provider === 'password' || (!u.provider && !String(u.providerId || '').includes('google'))
      ).length;

      const verifiedEmails = docs.filter((u: any) => u.emailVerified === true).length;
      const unverifiedEmails = docs.filter((u: any) => u.emailVerified !== true).length;

      // Recent 5 registered users
      const sortedByCreated = [...docs].sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      const recentUsers: AdminUserListItem[] = sortedByCreated.slice(0, 5).map((u: any) => ({
        uid: u.id || u.uid,
        id: u.id || u.uid,
        name: u.name || u.displayName || 'Trader',
        displayName: u.name || u.displayName || 'Trader',
        email: u.email || 'No email',
        photoURL: u.photoURL || u.avatarUrl || '',
        provider: u.provider || (u.providerId?.includes('google') ? 'google.com' : 'password'),
        createdAt: u.createdAt || 0,
        lastLoginAt: u.lastLoginAt || 0,
        emailVerified: u.emailVerified === true,
        status: u.status || 'ACTIVE'
      }));

      return {
        totalUsers,
        activeUsers,
        disabledUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        googleUsers,
        passwordUsers,
        verifiedEmails,
        unverifiedEmails,
        activityWindowDays,
        recentUsers
      };
    } catch (err: any) {
      console.warn('Failed to load admin stats directly from Firestore:', err?.message || err);
      // Fallback: If user is not yet created in Firestore, return zeroed stats
      return {
        totalUsers: 0,
        activeUsers: 0,
        disabledUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        googleUsers: 0,
        passwordUsers: 0,
        verifiedEmails: 0,
        unverifiedEmails: 0,
        activityWindowDays: 30,
        recentUsers: []
      };
    }
  },

  /**
   * Fetch registered users with search, filtering, sorting, and pagination
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    users: AdminUserListItem[];
    totalCount: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const limitCount = Math.max(1, Math.min(100, params.limit || 25));
    const search = (params.search || '').toLowerCase().trim();
    const filter = params.filter || 'ALL';
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      let allUsers: AdminUserListItem[] = usersSnap.docs.map(d => {
        const u = d.data();
        return {
          uid: d.id,
          id: d.id,
          name: u.name || u.displayName || 'Trader',
          displayName: u.name || u.displayName || 'Trader',
          email: u.email || 'No email',
          photoURL: u.photoURL || u.avatarUrl || '',
          provider: u.provider || (u.providerId?.includes('google') ? 'google.com' : 'password'),
          createdAt: u.createdAt || 0,
          lastLoginAt: u.lastLoginAt || 0,
          emailVerified: u.emailVerified === true,
          status: u.status || 'ACTIVE'
        };
      });

      // Filter by search query (name, email, uid)
      if (search) {
        allUsers = allUsers.filter(u => 
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.uid.toLowerCase().includes(search)
        );
      }

      // Filter by criteria
      const now = Date.now();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayTs = startOfToday.getTime();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
      const activityCutoff = now - 30 * 24 * 60 * 60 * 1000;

      if (filter === 'ACTIVE') {
        allUsers = allUsers.filter(u => 
          u.status === 'ACTIVE' && (
            (u.lastLoginAt && u.lastLoginAt >= activityCutoff) ||
            (u.createdAt && u.createdAt >= activityCutoff)
          )
        );
      } else if (filter === 'DISABLED' || filter === 'INACTIVE') {
        allUsers = allUsers.filter(u => 
          u.status === 'DISABLED' || 
          ((!u.lastLoginAt || u.lastLoginAt < activityCutoff) && (!u.createdAt || u.createdAt < activityCutoff))
        );
      } else if (filter === 'GOOGLE') {
        allUsers = allUsers.filter(u => u.provider.includes('google'));
      } else if (filter === 'PASSWORD') {
        allUsers = allUsers.filter(u => u.provider === 'password' || !u.provider.includes('google'));
      } else if (filter === 'VERIFIED') {
        allUsers = allUsers.filter(u => u.emailVerified);
      } else if (filter === 'UNVERIFIED') {
        allUsers = allUsers.filter(u => !u.emailVerified);
      } else if (filter === 'NEW_TODAY' || filter === 'TODAY') {
        allUsers = allUsers.filter(u => (u.createdAt || 0) >= startOfTodayTs);
      } else if (filter === 'NEW_WEEK' || filter === 'THIS_WEEK') {
        allUsers = allUsers.filter(u => (u.createdAt || 0) >= oneWeekAgo);
      } else if (filter === 'NEW_MONTH' || filter === 'THIS_MONTH') {
        allUsers = allUsers.filter(u => (u.createdAt || 0) >= oneMonthAgo);
      }

      // Sort
      allUsers.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      });

      const totalCount = allUsers.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limitCount));
      const startIndex = (page - 1) * limitCount;
      const paginatedUsers = allUsers.slice(startIndex, startIndex + limitCount);

      return {
        users: paginatedUsers,
        totalCount,
        page,
        totalPages,
        limit: limitCount
      };
    } catch (err: any) {
      console.warn('Failed to get users directly from Firestore:', err?.message || err);
      return {
        users: [],
        totalCount: 0,
        page: 1,
        totalPages: 1,
        limit: limitCount
      };
    }
  },

  /**
   * Subscribe to real-time updates for users
   */
  subscribeUsers(callback: (users: AdminUserListItem[]) => void): () => void {
    try {
      const unsub = onSnapshot(collection(db, 'users'), (snap) => {
        const users: AdminUserListItem[] = snap.docs.map(d => {
          const u = d.data();
          return {
            uid: d.id,
            id: d.id,
            name: u.name || u.displayName || 'Trader',
            displayName: u.name || u.displayName || 'Trader',
            email: u.email || 'No email',
            photoURL: u.photoURL || u.avatarUrl || '',
            provider: u.provider || (u.providerId?.includes('google') ? 'google.com' : 'password'),
            createdAt: u.createdAt || 0,
            lastLoginAt: u.lastLoginAt || 0,
            emailVerified: u.emailVerified === true,
            status: u.status || 'ACTIVE'
          };
        });
        callback(users);
      }, (err) => {
        console.warn('Real-time users subscription notice:', err?.message || err);
      });
      return unsub;
    } catch {
      return () => {};
    }
  },

  /**
   * Fetch detailed user profile and real trading summary
   */
  async getUserDetail(uid: string): Promise<AdminUserDetail> {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      throw new Error('User not found.');
    }

    const userData = userSnap.data();

    // Profile info
    const profileRef = doc(db, 'users', uid, 'profile', 'info');
    const profileSnap = await getDoc(profileRef).catch(() => null);
    const profileData = profileSnap?.exists() ? profileSnap.data() : {};

    // Aggregate real trades from user's dashboards
    let allTrades: any[] = [];
    try {
      const dashSnap = await getDocs(collection(db, 'users', uid, 'dashboards'));
      for (const d of dashSnap.docs) {
        const tradesSnap = await getDocs(collection(db, 'users', uid, 'dashboards', d.id, 'trades')).catch(() => null);
        if (tradesSnap) {
          tradesSnap.forEach(t => allTrades.push({ id: t.id, ...t.data() }));
        }
      }
    } catch (e) {
      console.warn('Trades summary aggregation notice:', e);
    }

    const totalTrades = allTrades.length;
    const winningTrades = allTrades.filter(t => t.result === 'WIN' || (typeof t.pnl === 'number' && t.pnl > 0)).length;
    const losingTrades = allTrades.filter(t => t.result === 'LOSS' || (typeof t.pnl === 'number' && t.pnl < 0)).length;
    const breakEvenTrades = allTrades.filter(t => t.result === 'BE' || t.pnl === 0).length;
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 1000) / 10 : 0;
    const totalPnl = allTrades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);

    const sortedTrades = [...allTrades].sort((a, b) => (b.date || b.createdAt || 0) - (a.date || a.createdAt || 0));
    const recentTrades = sortedTrades.slice(0, 5).map(t => ({
      id: t.id,
      market: t.market || t.instrument || 'Unknown',
      direction: t.direction || 'BUY',
      date: t.date || t.createdAt || Date.now(),
      result: t.result || 'WIN',
      pnl: Number(t.pnl) || 0
    }));

    return {
      uid: userSnap.id,
      id: userSnap.id,
      name: userData.name || userData.displayName || profileData?.fullName || 'Trader',
      displayName: userData.displayName || userData.name || profileData?.fullName || 'Trader',
      email: userData.email || 'No email',
      photoURL: userData.photoURL || profileData?.avatarUrl || '',
      provider: userData.provider || (userData.providerId?.includes('google') ? 'google.com' : 'password'),
      createdAt: userData.createdAt || 0,
      lastLoginAt: userData.lastLoginAt || 0,
      emailVerified: userData.emailVerified === true,
      status: userData.status || 'ACTIVE',
      tradingStyle: profileData?.tradingStyle || userData.tradingStyle || 'Discretionary',
      preferredMarkets: profileData?.preferredMarkets || userData.preferredMarkets || 'Forex & Indices',
      bio: profileData?.bio || userData.bio || '',
      tradingSummary: {
        totalTrades,
        winningTrades,
        losingTrades,
        breakEvenTrades,
        winRate,
        totalPnl,
        recentTrades
      }
    };
  },

  /**
   * Update user status (Active vs Disabled)
   */
  async updateUserStatus(uid: string, status: 'ACTIVE' | 'DISABLED', reason?: string): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      status,
      updatedAt: Date.now()
    });

    // Record administrative audit log
    try {
      const currentUser = auth.currentUser;
      await addDoc(collection(db, 'admin_audit_logs'), {
        adminEmail: currentUser?.email || BOOTSTRAP_ADMIN_EMAIL,
        adminUid: currentUser?.uid || 'admin',
        action: status === 'ACTIVE' ? 'ACCOUNT_ENABLED' : 'ACCOUNT_DISABLED',
        event: status === 'ACTIVE' ? 'Account Enabled' : 'Account Disabled',
        targetUid: uid,
        relatedObject: uid,
        details: { reason: reason || 'Administrative action' },
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Audit log write notice:', e);
    }
  },

  /**
   * Delete or permanently disable a user account
   */
  async deleteUserAccount(uid: string, _confirmation: string): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      status: 'DISABLED',
      isDeleted: true,
      updatedAt: Date.now()
    });

    try {
      const currentUser = auth.currentUser;
      await addDoc(collection(db, 'admin_audit_logs'), {
        adminEmail: currentUser?.email || BOOTSTRAP_ADMIN_EMAIL,
        adminUid: currentUser?.uid || 'admin',
        action: 'ACCOUNT_DELETED',
        event: 'Account Deleted',
        targetUid: uid,
        relatedObject: uid,
        details: { action: 'Soft delete account' },
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('Audit log write notice:', e);
    }
  },

  /**
   * Fetch administrative audit logs and real user events
   */
  async getActivity(limitCount: number = 50): Promise<AdminAuditLogEntry[]> {
    const events: AdminAuditLogEntry[] = [];

    // 1. Audit logs
    try {
      const logsSnap = await getDocs(collection(db, 'admin_audit_logs'));
      logsSnap.forEach(d => {
        const data = d.data();
        events.push({
          id: d.id,
          adminEmail: data.adminEmail,
          adminUid: data.adminUid,
          action: data.action || 'ADMIN_ACTION',
          event: data.event || data.action,
          targetUid: data.targetUid,
          targetEmail: data.targetEmail,
          relatedObject: data.relatedObject || data.targetEmail || data.targetUid,
          details: data.details,
          timestamp: data.timestamp || Date.now()
        });
      });
    } catch (e) {
      console.warn('Audit logs fetch notice:', e);
    }

    // 2. Real user registrations and logins from users collection
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(d => {
        const u = d.data();
        if (u.createdAt && typeof u.createdAt === 'number') {
          events.push({
            id: `reg-${d.id}`,
            action: 'USER_REGISTERED',
            event: 'New user registered',
            userEmail: u.email || 'Trader',
            userName: u.name || u.displayName || 'Trader',
            targetUid: d.id,
            targetEmail: u.email,
            relatedObject: u.email || d.id,
            timestamp: u.createdAt
          });
        }
        if (u.lastLoginAt && typeof u.lastLoginAt === 'number' && u.lastLoginAt !== u.createdAt) {
          events.push({
            id: `login-${d.id}-${u.lastLoginAt}`,
            action: 'USER_LOGIN',
            event: 'User logged in',
            userEmail: u.email || 'Trader',
            userName: u.name || u.displayName || 'Trader',
            targetUid: d.id,
            targetEmail: u.email,
            relatedObject: u.email || d.id,
            timestamp: u.lastLoginAt
          });
        }
      });
    } catch (e) {
      console.warn('User activity aggregation notice:', e);
    }

    // Sort chronologically newest first
    events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return events.slice(0, limitCount);
  }
};

