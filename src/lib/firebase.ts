import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDocFromServer,
  setLogLevel
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose internal connection warnings from Firestore SDK
setLogLevel('silent');

const app = initializeApp(firebaseConfig);

// In browser environments, initialize Firestore with long-polling to prevent
// WebChannel stream drop issues in iframes/proxies.
export const db = typeof window !== 'undefined'
  ? initializeFirestore(app, {
      experimentalForceLongPolling: true
    }, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection check timeout')), 2500)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
  } catch {
    // Graceful fallback: Firestore SDK will automatically handle offline cache
  }
}

if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}


