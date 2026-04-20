import fs from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

type ServiceAccountShape = Record<string, string>;

function normalizeServiceAccount(serviceAccount: ServiceAccountShape): ServiceAccountShape {
  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  return serviceAccount;
}

function parseServiceAccountJson(raw: string): ServiceAccountShape {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Empty Firebase service account payload');
  }

  const candidates = [trimmed];
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    candidates.push(trimmed.slice(1, -1));
  }

  const decodedBase64 = Buffer.from(trimmed, 'base64').toString('utf8').trim();
  if (decodedBase64.startsWith('{')) {
    candidates.push(decodedBase64);
  }

  for (const candidate of candidates) {
    try {
      return normalizeServiceAccount(JSON.parse(candidate) as ServiceAccountShape);
    } catch {
      // Try the next format.
    }
  }

  throw new Error('Server misconfiguration: invalid Firebase service account JSON');
}

function loadServiceAccount(): ServiceAccountShape {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (serviceAccountPath) {
    try {
      const fileContents = fs.readFileSync(serviceAccountPath, 'utf8');
      return parseServiceAccountJson(fileContents);
    } catch (err) {
      throw new Error(
        `Server misconfiguration: could not read Firebase service account file at ${serviceAccountPath}: ${
          err instanceof Error ? err.message : 'unknown error'
        }`
      );
    }
  }

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountRaw) {
    throw new Error(
      'Server misconfiguration: set FIREBASE_SERVICE_ACCOUNT_KEY_PATH or FIREBASE_SERVICE_ACCOUNT_KEY'
    );
  }

  return parseServiceAccountJson(serviceAccountRaw);
}

function ensureAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert(loadServiceAccount()),
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
