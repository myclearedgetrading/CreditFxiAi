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

function fakeNegativeItems(seed: string) {
  const n = Math.max(2, Math.min(6, seed.length % 6));
  const bureaus = ['Equifax', 'Experian', 'TransUnion'];
  return Array.from({ length: n }).map((_, idx) => ({
    id: `prov-${Date.now()}-${idx}`,
    type: idx % 2 ? 'Collection' : 'Late Payment',
    creditor: idx % 2 ? 'ABC Collections' : 'BigBank Card',
    accountNumber: '****',
    amount: 120 + idx * 35,
    dateReported: new Date(Date.now() - idx * 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    bureau: [bureaus[idx % bureaus.length]],
    status: 'Open',
  }));
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = getClientIp(req);
  const ipQuota = consumeRateLimit(`provider-sync-ip:${clientIp}`, 80, 60_000);
  if (!ipQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const uidQuota = consumeRateLimit(`provider-sync:${decoded.uid}`, 20, 60_000);
    if (!uidQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

    const userSnap = await getAdminDb().collection('users').doc(decoded.uid).get();
    if (!userSnap.exists) return res.status(403).json({ error: 'User profile not found' });

    const user = userSnap.data() as any;
    const companyId = user.companyId || decoded.uid;

    const connSnap = await getAdminDb().collection('providerConnections').doc(companyId).get();
    if (!connSnap.exists || connSnap.data()?.enabled !== true) {
      return res.status(409).json({ error: 'Provider not connected' });
    }

    // MVP: provider integration is implemented as a server-side normalized import.
    // If you plug in a real provider SDK, replace this block with real fetch + normalization.
    const negativeItems = fakeNegativeItems(decoded.uid);
    const score = 610 + (decoded.uid.length % 40);
    const now = nowIso();

    await getAdminDb().collection('creditReports').add({
      companyId,
      userId: decoded.uid,
      provider: connSnap.data()?.provider || 'GENERIC',
      reportAt: now,
      summary: {
        totalNegativeItems: negativeItems.length,
      },
      createdAt: now,
    });

    await getAdminDb().collection('scores').add({
      companyId,
      userId: decoded.uid,
      bureau: 'Experian',
      score,
      capturedAt: now,
      createdAt: now,
    });

    await getAdminDb().collection('users').doc(decoded.uid).set({
      negativeItems,
      creditScore: {
        equifax: score - 8,
        experian: score,
        transunion: score - 4,
      },
      lastReportAnalysisAt: now,
      lastReportFileName: 'provider-sync',
      lastReportSource: 'PROVIDER',
      lastNegativeItemCount: negativeItems.length,
      updatedAt: now,
    }, { merge: true });

    await getAdminDb().collection('integrations').doc(`${companyId}:credit_provider`).set({
      id: 'credit_provider',
      companyId,
      status: 'CONNECTED',
      health: 95,
      lastSync: now,
      updatedAt: now,
    }, { merge: true });

    return res.status(200).json({ ok: true, imported: { negativeItems: negativeItems.length, score } });
  } catch (err: unknown) {
    console.error('api/provider-sync error:', err);
    return res.status(500).json({ error: 'Provider sync failed' });
  }
}

