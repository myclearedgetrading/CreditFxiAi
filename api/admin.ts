import { extractBearerToken, getAdminAuth, getAdminDb } from './lib/firebaseAdmin';

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (n: number) => { json: (b: unknown) => void };
};

const VALID_ROLES = new Set(['USER', 'SPECIALIST', 'AUDITOR', 'ADMIN', 'SUPER_ADMIN']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getHeader(req: ApiRequest, key: string): string | undefined {
  const value = req.headers?.[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateCreateUserBody(body: unknown): {
  email: string;
  password: string;
  role: string;
  companyId: string;
  displayName: string;
} | null {
  const payload = body as {
    email?: unknown;
    password?: unknown;
    role?: unknown;
    companyId?: unknown;
    displayName?: unknown;
  };

  if (!isNonEmptyString(payload?.email) || !EMAIL_REGEX.test(payload.email)) {
    return null;
  }
  if (!isNonEmptyString(payload?.password) || payload.password.length < 12) {
    return null;
  }
  if (!isNonEmptyString(payload?.role) || !VALID_ROLES.has(payload.role)) {
    return null;
  }
  if (!isNonEmptyString(payload?.companyId) || payload.companyId.length > 80) {
    return null;
  }
  if (!isNonEmptyString(payload?.displayName) || payload.displayName.length > 120) {
    return null;
  }

  return {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: payload.role,
    companyId: payload.companyId.trim(),
    displayName: payload.displayName.trim(),
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const auth = getAdminAuth();
    const db = getAdminDb();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    const requesterDoc = await db.collection('users').doc(decodedToken.uid).get();
    const requesterRole = requesterDoc.data()?.role;
    if (requesterRole !== 'ADMIN' && requesterRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const payload = validateCreateUserBody(req.body);
    if (!payload) {
      return res.status(400).json({ message: 'Invalid request payload' });
    }
    if (payload.role === 'SUPER_ADMIN' && requesterRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admins can create super admins' });
    }
    if (payload.role === 'ADMIN' && requesterRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only super admins can create admins' });
    }

    const userRecord = await auth.createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.displayName,
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      role: payload.role,
      companyId: payload.companyId,
    });

    await db.collection('users').doc(userRecord.uid).set({
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      displayName: payload.displayName,
      id: userRecord.uid,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ uid: userRecord.uid, message: 'User created successfully' });

  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Failed to create user' });
  }
}