import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Read Firebase configuration
const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let cfg: any = {};
try {
  cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
} catch (err) {
  console.warn('Notice: Could not read firebase-applet-config.json:', err);
}

export const adminApp: App = getApps().length === 0 
  ? initializeApp({ projectId: cfg.projectId || process.env.FIREBASE_PROJECT_ID }) 
  : getApps()[0];

export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp, cfg.firestoreDatabaseId || '(default)');
export const firebaseAppConfig = cfg;
