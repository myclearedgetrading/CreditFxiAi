
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Use import.meta.env for Vite, fallback to process.env if polyfilled
// Cast import.meta to any to resolve TS error: Property 'env' does not exist on type 'ImportMeta'
const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
const authDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = (import.meta as any).env?.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

let app: FirebaseApp;

// Prevent white screen crash if config is missing
try {
  if (apiKey && !getApps().length) {
    app = initializeApp(firebaseConfig);
  } else if (getApps().length) {
    app = getApps()[0];
  } else {
    console.warn("Firebase configuration missing. App will run in offline/demo mode.");
    // Mock app structure to prevent immediate crash on export usage
    app = {} as FirebaseApp; 
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  app = {} as FirebaseApp;
}

// Export services safely. If app is mock, these might throw later if used, 
// but the initial UI render will succeed.
export const auth = app.name ? getAuth(app) : {} as any;
export const db = app.name ? getFirestore(app) : {} as any;
export const storage = app.name ? getStorage(app) : {} as any;
export const functions = app.name ? getFunctions(app) : {} as any;
export const googleProvider = new GoogleAuthProvider();

export default app;
