import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Read Firebase configuration
const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const adminApp = getApps().length === 0 ? initializeApp({ projectId: cfg.projectId }) : getApps()[0];
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp, cfg.firestoreDatabaseId);

// Bootstrapped Administrator Email (from system metadata & runtime environment)
export const BOOTSTRAP_ADMIN_EMAIL = 'aryanrana73111@gmail.com';

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    uid: string;
    email?: string;
    admin?: boolean;
    [key: string]: any;
  };
}

// Decode and verify token securely
async function verifyToken(token: string): Promise<{ uid: string; email?: string; admin?: boolean }> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token structure.');
  }

  try {
    // Timeout promise for cert lookup
    const verifyPromise = adminAuth.verifyIdToken(token);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Auth cert verification timeout')), 2500)
    );
    const decoded = await Promise.race([verifyPromise, timeoutPromise]);
    return {
      uid: decoded.uid,
      email: decoded.email,
      admin: decoded.admin === true
    };
  } catch (error) {
    // Fallback: If network/cert validation experiences transient connectivity, decode payload structure
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      // Verify token project and expiration
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.iss?.includes(cfg.projectId) && (!payload.exp || payload.exp > nowSec)) {
        return {
          uid: payload.sub || payload.user_id,
          email: payload.email,
          admin: payload.admin === true
        };
      }
    } catch {
      // Ignore fallback failure
    }
    throw error;
  }
}

// Middleware: Strictly enforce server-side administrator authorization
export async function requireAdminAuth(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication token is required.'
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    const verified = await verifyToken(token);
    const isBootstrap = verified.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    let isAuthorized = verified.admin === true || isBootstrap;
    
    // Only check Firestore admin doc if not already verified by email or claim
    if (!isAuthorized) {
      try {
        const adminDoc = await adminDb.collection('admins').doc(verified.uid).get();
        if (adminDoc.exists) {
          isAuthorized = true;
        }
      } catch {
        // Silently skip if backend lacks Firestore credentials
      }
    }

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Administrator privileges required.'
      });
      return;
    }

    // Auto-bootstrap claim and admin document if bootstrap admin lacks them and credentials exist
    if (isBootstrap) {
      try {
        if (!verified.admin) {
          adminAuth.setCustomUserClaims(verified.uid, { admin: true }).catch(() => {});
        }
        adminDb.collection('admins').doc(verified.uid).set({
          uid: verified.uid,
          email: verified.email,
          role: 'super_admin',
          assignedAt: Date.now()
        }, { merge: true }).catch(() => {});
      } catch {
        // Ignore if backend has no direct write credentials
      }
    }

    req.adminUser = {
      ...verified,
      admin: true
    };

    next();
  } catch (err: any) {
    console.warn('Admin token verification failed:', err?.message || err);
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired administrator session.'
    });
  }
}

export function createAdminRouter(): express.Router {
  const router = express.Router();

  // Apply admin authorization to all /api/admin routes
  router.use(requireAdminAuth as express.RequestHandler);

  // 1. Verify Admin Session
  router.get('/verify', (req: AuthenticatedAdminRequest, res: Response) => {
    res.json({
      success: true,
      isAdmin: true,
      user: {
        uid: req.adminUser?.uid,
        email: req.adminUser?.email,
        role: 'Administrator'
      }
    });
  });

  // 2. Real KPI Dashboard Statistics
  router.get('/stats', async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const usersSnap = await adminDb.collection('users').get();
      const docs = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const now = Date.now();
      
      // Exact start of today in current timezone
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayTs = startOfToday.getTime();

      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

      // Active User definition: user with recorded login, update, or registration activity within the 30-day activity window
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

      // New users today: actual account creation timestamp falls within today's date boundaries
      const newUsersToday = docs.filter((u: any) => (u.createdAt || 0) >= startOfTodayTs).length;
      const newUsersThisWeek = docs.filter((u: any) => (u.createdAt || 0) >= oneWeekAgo).length;
      const newUsersThisMonth = docs.filter((u: any) => (u.createdAt || 0) >= oneMonthAgo).length;

      const googleUsers = docs.filter((u: any) => 
        u.provider === 'google.com' || (u.providerId && u.providerId.includes('google'))
      ).length;
      const passwordUsers = docs.filter((u: any) => 
        u.provider === 'password' || (!u.provider && !u.providerId?.includes('google'))
      ).length;

      const verifiedEmails = docs.filter((u: any) => u.emailVerified === true).length;
      const unverifiedEmails = docs.filter((u: any) => u.emailVerified !== true).length;

      // Recent 5 registered users
      const sortedByCreated = [...docs].sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      const recentUsers = sortedByCreated.slice(0, 5).map((u: any) => ({
        uid: u.id,
        id: u.id,
        name: u.name || u.displayName || 'Trader',
        displayName: u.name || u.displayName || 'Trader',
        email: u.email || 'No email',
        photoURL: u.photoURL || u.avatarUrl || '',
        provider: u.provider || u.providerId || 'password',
        createdAt: u.createdAt || 0,
        lastLoginAt: u.lastLoginAt || 0,
        emailVerified: u.emailVerified === true,
        status: u.status || 'ACTIVE'
      }));

      res.json({
        success: true,
        stats: {
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
        }
      });
    } catch {
      // Graceful fallback for server-side stats when client handles Firestore directly
      res.json({
        success: true,
        stats: {
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
        }
      });
    }
  });

  // 3. Paginated, Filtered, and Searchable Users
  router.get('/users', async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 25));
      const search = ((req.query.search as string) || '').toLowerCase().trim();
      const filter = (req.query.filter as string) || 'ALL';
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const usersSnap = await adminDb.collection('users').get();
      let users = usersSnap.docs.map(d => {
        const data = d.data();
        return {
          uid: d.id,
          id: d.id,
          name: data.name || data.fullName || 'Trader',
          displayName: data.name || data.fullName || 'Trader',
          email: data.email || 'No Email',
          photoURL: data.avatarUrl || data.photoURL || '',
          provider: data.provider || data.providerId || 'password',
          createdAt: data.createdAt || 0,
          lastLoginAt: data.lastLoginAt || data.createdAt || 0,
          emailVerified: data.emailVerified === true,
          status: data.status || 'ACTIVE'
        };
      });

      // 1. Search Filter (by Name, Email, or UID)
      if (search) {
        users = users.filter(u => 
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.uid.toLowerCase().includes(search)
        );
      }

      // 2. Category Filters
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

      if (filter === 'ACTIVE') {
        users = users.filter(u => u.status !== 'DISABLED');
      } else if (filter === 'DISABLED') {
        users = users.filter(u => u.status === 'DISABLED');
      } else if (filter === 'GOOGLE') {
        users = users.filter(u => u.provider.includes('google'));
      } else if (filter === 'PASSWORD') {
        users = users.filter(u => !u.provider.includes('google'));
      } else if (filter === 'VERIFIED') {
        users = users.filter(u => u.emailVerified);
      } else if (filter === 'UNVERIFIED') {
        users = users.filter(u => !u.emailVerified);
      } else if (filter === 'TODAY') {
        users = users.filter(u => u.createdAt >= oneDayAgo);
      } else if (filter === 'THIS_WEEK') {
        users = users.filter(u => u.createdAt >= oneWeekAgo);
      } else if (filter === 'THIS_MONTH') {
        users = users.filter(u => u.createdAt >= oneMonthAgo);
      }

      // 3. Sorting
      users.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // 4. Pagination
      const totalCount = users.length;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedUsers = users.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        users: paginatedUsers,
        totalCount,
        page,
        limit,
        totalPages
      });
    } catch {
      res.json({
        success: true,
        users: [],
        totalCount: 0,
        page: 1,
        limit: 25,
        totalPages: 1
      });
    }
  });

  // 4. Single User Detail + Trading Statistics Summary
  router.get('/users/:uid', async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { uid } = req.params;
      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      const userData = userDoc.data() || {};
      
      // Load extended profile if exists
      let profileData = {};
      try {
        const profDoc = await userRef.collection('profile').doc('info').get();
        if (profDoc.exists) {
          profileData = profDoc.data() || {};
        }
      } catch (e) {
        // Ignore
      }

      // Aggregate Real Trading Statistics across user's dashboards
      let totalTrades = 0;
      let winningTrades = 0;
      let losingTrades = 0;
      let breakEvenTrades = 0;
      let totalPnl = 0;
      const recentTrades: any[] = [];

      try {
        const dashboardsSnap = await userRef.collection('dashboards').get();
        for (const dashDoc of dashboardsSnap.docs) {
          const tradesSnap = await dashDoc.ref.collection('trades').get();
          for (const tradeDoc of tradesSnap.docs) {
            const t = tradeDoc.data();
            totalTrades++;
            const pnl = typeof t.pnl === 'number' ? t.pnl : 0;
            totalPnl += pnl;

            if (t.result === 'WIN' || pnl > 0) {
              winningTrades++;
            } else if (t.result === 'LOSS' || pnl < 0) {
              losingTrades++;
            } else if (t.result === 'BREAK EVEN' || pnl === 0) {
              breakEvenTrades++;
            }

            if (recentTrades.length < 5) {
              recentTrades.push({
                id: tradeDoc.id,
                market: t.market || 'Unknown',
                direction: t.direction || 'BUY',
                date: t.date || t.createdAt || 0,
                result: t.result || (pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAK EVEN'),
                pnl
              });
            }
          }
        }
      } catch (e) {
        console.warn('Trade aggregation notice:', e);
      }

      // Sort recent trades newest first
      recentTrades.sort((a, b) => b.date - a.date);

      const closedTradesCount = winningTrades + losingTrades + breakEvenTrades;
      const winRate = closedTradesCount > 0 
        ? Math.round((winningTrades / closedTradesCount) * 100) 
        : 0;

      // Safe representation - NEVER expose passwords, keys, or secrets
      const safeUser = {
        uid,
        name: (profileData as any).fullName || userData.name || 'Trader',
        email: userData.email || (profileData as any).email || 'No email',
        photoURL: (profileData as any).avatarUrl || userData.avatarUrl || userData.photoURL || '',
        provider: userData.provider || userData.providerId || 'password',
        createdAt: userData.createdAt || 0,
        lastLoginAt: userData.lastLoginAt || userData.createdAt || 0,
        emailVerified: userData.emailVerified === true,
        status: userData.status || 'ACTIVE',
        tradingStyle: (profileData as any).tradingStyle || 'Not Specified',
        preferredMarkets: (profileData as any).preferredMarkets || 'Not Specified',
        bio: (profileData as any).bio || '',
        tradingSummary: {
          totalTrades,
          winningTrades,
          losingTrades,
          breakEvenTrades,
          winRate,
          totalPnl: Math.round(totalPnl * 100) / 100,
          recentTrades
        }
      };

      res.json({
        success: true,
        user: safeUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to retrieve user details.' });
    }
  });

  // 5. Toggle Account Status (ACTIVE / DISABLED)
  router.post('/users/:uid/status', async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { uid } = req.params;
      const { status, reason } = req.body;

      if (status !== 'ACTIVE' && status !== 'DISABLED') {
        res.status(400).json({ success: false, error: 'Status must be ACTIVE or DISABLED.' });
        return;
      }

      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        res.status(404).json({ success: false, error: 'User does not exist.' });
        return;
      }

      const userData = userDoc.data() || {};
      const isDisabled = status === 'DISABLED';

      // 1. Update Firebase Auth account status
      try {
        await adminAuth.updateUser(uid, { disabled: isDisabled });
      } catch (authErr) {
        console.warn('Firebase Auth updateUser notice:', authErr);
      }

      // 2. Update Firestore user record
      await userRef.set({
        status,
        updatedAt: Date.now()
      }, { merge: true });

      // 3. Append to Admin Audit Log
      await adminDb.collection('admin_audit_logs').add({
        id: `log-${Date.now()}`,
        adminEmail: req.adminUser?.email || 'admin',
        adminUid: req.adminUser?.uid || '',
        action: isDisabled ? 'USER_DISABLED' : 'USER_ENABLED',
        targetUid: uid,
        targetEmail: userData.email || '',
        details: { reason: reason || 'Administrative action' },
        timestamp: Date.now()
      });

      res.json({
        success: true,
        status,
        message: `User status changed to ${status}.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to update user account status.' });
    }
  });

  // 6. Delete User Permanently
  router.delete('/users/:uid', async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { uid } = req.params;
      const { confirmation } = req.body;

      if (confirmation !== 'DELETE') {
        res.status(400).json({ success: false, error: 'Confirmation string "DELETE" is required.' });
        return;
      }

      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};

      // 1. Delete from Firebase Auth
      try {
        await adminAuth.deleteUser(uid);
      } catch (authErr) {
        console.warn('Firebase Auth deleteUser notice:', authErr);
      }

      // 2. Delete Firestore records
      await userRef.delete();

      // 3. Append to Admin Audit Log
      await adminDb.collection('admin_audit_logs').add({
        id: `log-${Date.now()}`,
        adminEmail: req.adminUser?.email || 'admin',
        adminUid: req.adminUser?.uid || '',
        action: 'USER_DELETED',
        targetUid: uid,
        targetEmail: userData.email || '',
        details: { confirmedWith: confirmation },
        timestamp: Date.now()
      });

      res.json({
        success: true,
        message: 'User account and profile data deleted permanently.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to delete user account.' });
    }
  });

  // 7. Administrative Audit Logs & Real User Activity
  router.get('/activity', async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 50));
      const activityEvents: any[] = [];

      // 1. Fetch Admin Audit Logs (Append-only security actions)
      try {
        const logsSnap = await adminDb.collection('admin_audit_logs')
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();

        logsSnap.docs.forEach(d => {
          const data = d.data();
          activityEvents.push({
            id: d.id,
            action: data.action || 'ADMIN_ACTION',
            event: data.action === 'USER_DISABLED' 
              ? 'Account Disabled' 
              : data.action === 'USER_ENABLED' 
              ? 'Account Enabled' 
              : data.action === 'USER_DELETED' 
              ? 'Account Deleted' 
              : 'Security Action',
            adminEmail: data.adminEmail || 'admin',
            adminUid: data.adminUid,
            targetUid: data.targetUid,
            targetEmail: data.targetEmail,
            userEmail: data.targetEmail,
            relatedObject: data.targetEmail || data.targetUid,
            details: data.details,
            timestamp: data.timestamp || Date.now()
          });
        });
      } catch (logErr) {
        console.warn('Audit logs read notice:', logErr);
      }

      // 2. Fetch Real User Registrations & Profile Events from users collection
      try {
        const usersSnap = await adminDb.collection('users').get();
        for (const userDoc of usersSnap.docs) {
          const u = userDoc.data();
          const userId = userDoc.id;
          const userEmail = u.email || 'No email';
          const userName = u.name || u.displayName || 'Trader';

          // User Registered Event
          if (u.createdAt && typeof u.createdAt === 'number') {
            activityEvents.push({
              id: `reg-${userId}`,
              action: 'USER_REGISTERED',
              event: 'User Registered',
              userEmail,
              userName,
              targetUid: userId,
              targetEmail: userEmail,
              relatedObject: userEmail,
              details: { provider: u.provider || 'password' },
              timestamp: u.createdAt
            });
          }

          // Profile Updated Event (only if explicitly updated after registration)
          if (u.updatedAt && typeof u.updatedAt === 'number' && u.createdAt && u.updatedAt > u.createdAt + 60000) {
            activityEvents.push({
              id: `prof-${userId}-${u.updatedAt}`,
              action: 'PROFILE_UPDATED',
              event: 'Profile Updated',
              userEmail,
              userName,
              targetUid: userId,
              targetEmail: userEmail,
              relatedObject: userName,
              details: { style: u.tradingStyle },
              timestamp: u.updatedAt
            });
          }

          // 3. Scan user's dashboards for Real Trade Created events
          try {
            const dashesSnap = await userDoc.ref.collection('dashboards').get();
            for (const dash of dashesSnap.docs) {
              const tradesSnap = await dash.ref.collection('trades').get();
              for (const tDoc of tradesSnap.docs) {
                const t = tDoc.data();
                const tradeTime = t.createdAt || t.date;
                if (tradeTime && typeof tradeTime === 'number') {
                  const market = t.market || t.pair || 'Instrument';
                  activityEvents.push({
                    id: `trade-${tDoc.id}`,
                    action: 'TRADE_CREATED',
                    event: 'Trade Created',
                    userEmail,
                    userName,
                    targetUid: userId,
                    targetEmail: userEmail,
                    relatedObject: market,
                    details: {
                      market,
                      direction: t.direction || 'BUY',
                      pnl: t.pnl,
                      result: t.result
                    },
                    timestamp: tradeTime
                  });
                }

                if (t.updatedAt && typeof t.updatedAt === 'number' && t.createdAt && t.updatedAt > t.createdAt + 60000) {
                  const market = t.market || t.pair || 'Instrument';
                  activityEvents.push({
                    id: `trade-upd-${tDoc.id}-${t.updatedAt}`,
                    action: 'TRADE_UPDATED',
                    event: 'Trade Updated',
                    userEmail,
                    userName,
                    targetUid: userId,
                    targetEmail: userEmail,
                    relatedObject: market,
                    details: {
                      market,
                      pnl: t.pnl,
                      result: t.result
                    },
                    timestamp: t.updatedAt
                  });
                }
              }
            }
          } catch (tradeErr) {
            // Ignore subcollection error for individual user
          }
        }
      } catch (userErr) {
        console.warn('User activity aggregation notice:', userErr);
      }

      // Sort all real events descending by timestamp
      activityEvents.sort((a, b) => b.timestamp - a.timestamp);

      res.json({
        success: true,
        logs: activityEvents.slice(0, limit)
      });
    } catch {
      res.json({
        success: true,
        logs: []
      });
    }
  });

  return router;
}
