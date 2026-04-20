import { extractBearerToken, getAdminAuth, getAdminDb } from './lib/firebaseAdmin';
import { consumeRateLimit } from './lib/rateLimit';
import { encryptString } from './lib/crypto';

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

type ApiResponse = {
  status: (n: number) => { json: (b: unknown) => void };
};

type IntegrationId = 'credit_provider' | 'delivery_mailfax';

type IntegrationRecord = {
  id: IntegrationId;
  companyId: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  health: number;
  lastSync?: string;
  updatedAt: string;
  createdAt: string;
};

const INTEGRATION_CATALOG: Record<IntegrationId, { name: string; category: string; description: string; icon: string; requiresOAuth: boolean }> = {
  credit_provider: {
    name: 'Credit Data Provider',
    category: 'CREDIT_BUREAU',
    description: 'Import tradelines, negative items, and score updates automatically.',
    icon: 'Shield',
    requiresOAuth: true,
  },
  delivery_mailfax: {
    name: 'Mail/Fax Delivery',
    category: 'DOCUMENT',
    description: 'Send dispute packets by mail/fax with tracking and delivery status.',
    icon: 'Mail',
    requiresOAuth: false,
  },
};

function getHeader(req: ApiRequest, key: string): string | undefined {
  const value = req.headers?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function getClientIp(req: ApiRequest): string {
  const forwardedFor = getHeader(req, 'x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function nowIso() {
  return new Date().toISOString();
}

async function requireUser(req: ApiRequest) {
  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) throw new Error('AUTH_REQUIRED');
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const snap = await getAdminDb().collection('users').doc(decoded.uid).get();
  if (!snap.exists) throw new Error('PROFILE_NOT_FOUND');
  const user = snap.data() as { companyId?: string; role?: string; email?: string };
  const companyId = user.companyId || decoded.uid;
  return { uid: decoded.uid, companyId, role: user.role || 'USER', email: user.email || '' };
}

async function upsertIntegration(companyId: string, id: IntegrationId, patch: Partial<IntegrationRecord>) {
  const db = getAdminDb();
  const ref = db.collection('integrations').doc(`${companyId}:${id}`);
  const base: IntegrationRecord = {
    id,
    companyId,
    status: 'DISCONNECTED',
    health: 0,
    updatedAt: nowIso(),
    createdAt: nowIso(),
  };
  await ref.set({ ...base, ...patch, updatedAt: nowIso() }, { merge: true });
  const out = await ref.get();
  return out.data() as IntegrationRecord;
}

async function listIntegrations(companyId: string) {
  const db = getAdminDb();
  const ids = Object.keys(INTEGRATION_CATALOG) as IntegrationId[];
  const refs = ids.map((id) => db.collection('integrations').doc(`${companyId}:${id}`));
  const snaps = await db.getAll(...refs);
  const byId = new Map<IntegrationId, IntegrationRecord>();
  snaps.forEach((s) => {
    if (s.exists) {
      const data = s.data() as IntegrationRecord;
      byId.set(data.id, data);
    }
  });

  return ids.map((id) => {
    const meta = INTEGRATION_CATALOG[id];
    const rec = byId.get(id);
    return {
      id,
      name: meta.name,
      category: meta.category,
      description: meta.description,
      icon: meta.icon,
      requiresOAuth: meta.requiresOAuth,
      status: rec?.status || 'DISCONNECTED',
      health: rec?.health ?? 0,
      lastSync: rec?.lastSync,
    };
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = getClientIp(req);
  const ipQuota = consumeRateLimit(`integrations-ip:${clientIp}`, 120, 60_000);
  if (!ipQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

  try {
    const { uid, companyId } = await requireUser(req);
    const uidQuota = consumeRateLimit(`integrations:${uid}`, 60, 60_000);
    if (!uidQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

    const body = (req.body || {}) as { action?: string; integrationId?: IntegrationId; payload?: any };
    const action = String(body.action || '');
    const integrationId = body.integrationId as IntegrationId | undefined;

    if (action === 'list') {
      const integrations = await listIntegrations(companyId);
      return res.status(200).json({ integrations });
    }

    if (!integrationId || !(integrationId in INTEGRATION_CATALOG)) {
      return res.status(400).json({ error: 'Invalid integrationId' });
    }

    if (action === 'disconnect') {
      await upsertIntegration(companyId, integrationId, { status: 'DISCONNECTED', health: 0 });
      if (integrationId === 'credit_provider') {
        // Keep connection doc for audit; mark disabled.
        await getAdminDb().collection('providerConnections').doc(companyId).set({
          companyId,
          enabled: false,
          updatedAt: nowIso(),
        }, { merge: true });
      }
      if (integrationId === 'delivery_mailfax') {
        await getAdminDb().collection('deliveryProviders').doc(companyId).set({
          companyId,
          enabled: false,
          updatedAt: nowIso(),
        }, { merge: true });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'connect') {
      if (integrationId === 'credit_provider') {
        const provider = String(body.payload?.provider || 'GENERIC');
        const accessToken = String(body.payload?.accessToken || '');
        const externalUserId = String(body.payload?.externalUserId || '');
        if (!accessToken || accessToken.length < 10) {
          return res.status(400).json({ error: 'Missing accessToken' });
        }
        await getAdminDb().collection('providerConnections').doc(companyId).set({
          companyId,
          provider,
          enabled: true,
          externalUserId,
          accessTokenEnc: encryptString(accessToken),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }, { merge: true });
        await upsertIntegration(companyId, integrationId, { status: 'CONNECTED', health: 95 });
        return res.status(200).json({ ok: true });
      }

      if (integrationId === 'delivery_mailfax') {
        const provider = String(body.payload?.provider || 'MOCK');
        const apiKey = String(body.payload?.apiKey || '');
        const senderName = String(body.payload?.senderName || '');
        if (provider !== 'MOCK' && apiKey.length < 5) {
          return res.status(400).json({ error: 'Missing apiKey' });
        }
        await getAdminDb().collection('deliveryProviders').doc(companyId).set({
          companyId,
          provider,
          enabled: true,
          senderName,
          apiKeyEnc: apiKey ? encryptString(apiKey) : null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }, { merge: true });
        await upsertIntegration(companyId, integrationId, { status: 'CONNECTED', health: 90 });
        return res.status(200).json({ ok: true });
      }
    }

    if (action === 'sync') {
      // Sync is integration-specific; we persist a timestamp and let specialized routes do the heavy work.
      await upsertIntegration(companyId, integrationId, { lastSync: nowIso(), health: 95, status: 'CONNECTED' });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'AUTH_REQUIRED') return res.status(401).json({ error: 'Authentication required' });
    if (msg === 'PROFILE_NOT_FOUND') return res.status(403).json({ error: 'User profile not found' });
    console.error('api/integrations error:', err);
    return res.status(500).json({ error: 'Integration request failed' });
  }
}

