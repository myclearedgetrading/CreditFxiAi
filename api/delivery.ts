import crypto from 'node:crypto';
import { extractBearerToken, getAdminAuth, getAdminDb } from './lib/firebaseAdmin.js';
import { consumeRateLimit } from './lib/rateLimit.js';

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

type ApiResponse = {
  status: (n: number) => { json: (b: unknown) => void };
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

type SendPayload = {
  disputeId: string;
  disputeRoundId: string;
  clientId: string;
  companyId: string;
  channel: 'MAIL' | 'FAX';
  // For MVP we send the letter body text and capture shipping details separately later.
  letterText: string;
  recipients: { label: string; address: string }[];
};

function isSendPayload(p: any): p is SendPayload {
  return !!p
    && typeof p.disputeId === 'string'
    && typeof p.disputeRoundId === 'string'
    && typeof p.clientId === 'string'
    && typeof p.companyId === 'string'
    && (p.channel === 'MAIL' || p.channel === 'FAX')
    && typeof p.letterText === 'string'
    && p.letterText.length > 50
    && Array.isArray(p.recipients)
    && p.recipients.length > 0;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = getClientIp(req);
  const ipQuota = consumeRateLimit(`delivery-ip:${clientIp}`, 120, 60_000);
  if (!ipQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const uidQuota = consumeRateLimit(`delivery:${decoded.uid}`, 30, 60_000);
    if (!uidQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

    const userSnap = await getAdminDb().collection('users').doc(decoded.uid).get();
    if (!userSnap.exists) return res.status(403).json({ error: 'User profile not found' });

    const user = userSnap.data() as any;
    const userCompanyId = user.companyId || decoded.uid;

    const body = (req.body || {}) as { action?: string; payload?: unknown };
    if (body.action !== 'send') return res.status(400).json({ error: 'Unknown action' });
    if (!isSendPayload(body.payload)) return res.status(400).json({ error: 'Invalid send payload' });

    const payload = body.payload as SendPayload;
    if (payload.companyId !== userCompanyId) return res.status(403).json({ error: 'Tenant mismatch' });
    if (payload.clientId !== decoded.uid) return res.status(403).json({ error: 'Client mismatch' });

    const now = nowIso();
    const providerSnap = await getAdminDb().collection('deliveryProviders').doc(payload.companyId).get();
    const provider = providerSnap.exists ? String(providerSnap.data()?.provider || 'MOCK') : 'MOCK';
    const enabled = providerSnap.exists ? providerSnap.data()?.enabled !== false : true;
    if (!enabled) return res.status(409).json({ error: 'Delivery provider not connected' });

    // MVP Provider: MOCK. Creates a delivery record + tracking id and marks round as SENT.
    const deliveryId = crypto.randomUUID();
    const trackingId = `MOCK-${deliveryId.slice(0, 8).toUpperCase()}`;
    await getAdminDb().collection('deliveries').doc(deliveryId).set({
      id: deliveryId,
      companyId: payload.companyId,
      clientId: payload.clientId,
      disputeId: payload.disputeId,
      disputeRoundId: payload.disputeRoundId,
      channel: payload.channel,
      provider,
      status: 'SENT',
      trackingId,
      recipients: payload.recipients,
      costCents: 0,
      createdAt: now,
      updatedAt: now,
      sentAt: now,
      lastEventAt: now,
    });

    await getAdminDb().collection('deliveryEvents').add({
      companyId: payload.companyId,
      deliveryId,
      eventType: 'SENT',
      provider,
      providerEventId: trackingId,
      payload: { channel: payload.channel, recipients: payload.recipients.map((r) => r.label) },
      createdAt: now,
    });

    await getAdminDb().collection('disputeRounds').doc(payload.disputeRoundId).set({
      status: 'SENT',
      sentAt: now,
      updatedAt: now,
      delivery: {
        deliveryId,
        provider,
        trackingId,
        channel: payload.channel,
      },
    }, { merge: true });

    await getAdminDb().collection('disputes').doc(payload.disputeId).set({
      overallStatus: 'SENT',
      updatedAt: now,
    }, { merge: true });

    await getAdminDb().collection('integrations').doc(`${payload.companyId}:delivery_mailfax`).set({
      id: 'delivery_mailfax',
      companyId: payload.companyId,
      status: 'CONNECTED',
      health: 95,
      lastSync: now,
      updatedAt: now,
    }, { merge: true });

    return res.status(200).json({ ok: true, deliveryId, trackingId });
  } catch (err: unknown) {
    console.error('api/delivery error:', err);
    return res.status(500).json({ error: 'Delivery request failed' });
  }
}

