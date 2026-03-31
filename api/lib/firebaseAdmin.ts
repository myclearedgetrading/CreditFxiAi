import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function ensureAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountRaw) {
    throw new Error('Server misconfiguration: FIREBASE_SERVICE_ACCOUNT_KEY is required');
  }

  let serviceAccount: Record<string, string>;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch {
    throw new Error('Server misconfiguration: invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminAuth() {
  const app = ensureAdminApp();
  return getAuth(app);
}

export function getAdminDb() {
  const app = ensureAdminApp();
  return getFirestore(app);
}

export function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
