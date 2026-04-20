import { decryptString } from './lib/crypto.js';
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

type EncryptedBlob = Parameters<typeof decryptString>[0];
type BureauName = 'Equifax' | 'Experian' | 'TransUnion';
type ScoreSnapshot = { equifax: number; experian: number; transunion: number };

type ProviderConnectionRecord = {
  companyId: string;
  enabled?: boolean;
  provider?: string;
  externalUserId?: string;
  reportVariant?: 'standard' | 'epic' | string | null;
  accessTokenEnc?: EncryptedBlob | null;
  apiAccessEmailEnc?: EncryptedBlob | null;
  apiAccessPasswordEnc?: EncryptedBlob | null;
  memberUsernameEnc?: EncryptedBlob | null;
  memberPasswordEnc?: EncryptedBlob | null;
  updatedAt?: string;
};

type MfsnSyncResult = {
  negativeItems: Array<{
    id: string;
    type: string;
    creditor: string;
    accountNumber: string;
    amount: number;
    dateReported: string;
    bureau: BureauName[];
    status: 'Open';
  }>;
  scoreSnapshot: ScoreSnapshot;
  reportVariant: 'standard' | 'epic';
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

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const out = asString(value);
    if (out) return out;
  }
  return '';
}

function readEncryptedString(blob: EncryptedBlob | null | undefined): string {
  if (!blob) return '';
  try {
    return decryptString(blob).trim();
  } catch {
    return '';
  }
}

function stripBearerPrefix(token: string): string {
  return token.replace(/^Bearer\s+/i, '').trim();
}

function getMfsnBaseUrl(): string {
  return (process.env.MFSN_API_BASE_URL || 'https://server.myfreescorenow.com').replace(/\/+$/, '');
}

function normalizeBureau(value: unknown): BureauName | null {
  const input = asString(value).toLowerCase();
  if (!input) return null;
  if (input.includes('equifax') || input === 'eqf' || input === 'eq') return 'Equifax';
  if (input.includes('experian') || input === 'exp' || input === 'ex') return 'Experian';
  if (input.includes('transunion') || input.includes('trans union') || input === 'tuc' || input === 'tu') {
    return 'TransUnion';
  }
  return null;
}

function maskAccountNumber(value: unknown): string {
  const raw = asString(value).replace(/\s+/g, '');
  if (!raw) return '****';
  const last4 = raw.replace(/[^0-9A-Za-z]/g, '').slice(-4);
  return last4 ? `****${last4}` : '****';
}

function reportVariantFromConnection(connection: ProviderConnectionRecord): 'standard' | 'epic' {
  return String(connection.reportVariant || '').toLowerCase() === 'epic' ? 'epic' : 'standard';
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }
    return { response, data };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timed out while contacting MyFreeScoreNow.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getMfsnAccessToken(connection: ProviderConnectionRecord): Promise<string> {
  const directToken = stripBearerPrefix(readEncryptedString(connection.accessTokenEnc));
  if (directToken) return directToken;

  const apiAccessEmail = readEncryptedString(connection.apiAccessEmailEnc);
  const apiAccessPassword = readEncryptedString(connection.apiAccessPasswordEnc);
  if (!apiAccessEmail || !apiAccessPassword) {
    throw new Error('MyFreeScoreNow API credentials are missing. Reconnect the provider and include an API token or API access login.');
  }

  const { response, data } = await postJson(`${getMfsnBaseUrl()}/api/auth/login`, {
    email: apiAccessEmail,
    password: apiAccessPassword,
  });

  const token = stripBearerPrefix(firstNonEmpty(data?.data?.token, data?.token));
  if (!response.ok || data?.success === false || !token) {
    const upstreamError = firstNonEmpty(data?.message, data?.error, data?.raw);
    throw new Error(upstreamError || `MyFreeScoreNow login failed (${response.status}).`);
  }

  return token;
}

function walkRecords(value: unknown, visitor: (record: Record<string, any>) => void) {
  if (Array.isArray(value)) {
    value.forEach((entry) => walkRecords(entry, visitor));
    return;
  }
  if (!isRecord(value)) return;
  visitor(value);
  Object.values(value).forEach((entry) => walkRecords(entry, visitor));
}

function extractTradelines(report: unknown): Record<string, any>[] {
  const tradelines: Record<string, any>[] = [];
  const seen = new Set<string>();

  walkRecords(report, (record) => {
    for (const tradeline of toArray(record.Tradeline)) {
      if (!isRecord(tradeline)) continue;
      const key = [
        firstNonEmpty(tradeline.creditorName, tradeline.subscriberCode, tradeline.position),
        firstNonEmpty(tradeline.accountNumber),
        firstNonEmpty(tradeline.bureau, tradeline.Source?.Bureau?.description, tradeline.Source?.Bureau?.abbreviation),
        firstNonEmpty(tradeline.dateReported, tradeline.dateAccountStatus),
      ].join('|');
      if (!seen.has(key)) {
        seen.add(key);
        tradelines.push(tradeline);
      }
    }
  });

  return tradelines;
}

function looksNegative(tradeline: Record<string, any>): boolean {
  const payStatusText = [
    tradeline.PayStatus?.abbreviation,
    tradeline.PayStatus?.description,
    tradeline.AccountCondition?.abbreviation,
    tradeline.AccountCondition?.description,
    tradeline.OpenClosed?.description,
    tradeline.CollectionTrade?.creditType?.description,
    tradeline.accountTypeDescription,
  ].map(asString).join(' ').toLowerCase();

  const grantedTrade = isRecord(tradeline.GrantedTrade) ? tradeline.GrantedTrade : {};
  const late30 = parseNumber(grantedTrade.late30Count) || 0;
  const late60 = parseNumber(grantedTrade.late60Count) || 0;
  const late90 = parseNumber(grantedTrade.late90Count) || 0;
  const amountPastDue = parseNumber(grantedTrade.amountPastDue) || parseNumber(tradeline.amountPastDue) || 0;

  return Boolean(
    tradeline.CollectionTrade
    || /\bderog\b/.test(payStatusText)
    || /\bcollection\b/.test(payStatusText)
    || /charge.?off|coll\/chargeoff/.test(payStatusText)
    || late30 > 0
    || late60 > 0
    || late90 > 0
    || amountPastDue > 0
  );
}

function normalizeNegativeItems(report: unknown) {
  const items: MfsnSyncResult['negativeItems'] = [];
  const seen = new Set<string>();

  for (const tradeline of extractTradelines(report)) {
    if (!looksNegative(tradeline)) continue;

    const bureau = normalizeBureau(
      firstNonEmpty(
        tradeline.bureau,
        tradeline.Source?.Bureau?.description,
        tradeline.Source?.Bureau?.abbreviation,
      ),
    ) || 'Experian';

    const creditor = firstNonEmpty(tradeline.creditorName, tradeline.subscriberCode, 'Unknown Creditor');
    const type = firstNonEmpty(
      tradeline.CollectionTrade?.creditType?.description,
      tradeline.GrantedTrade?.CreditType?.description,
      tradeline.GrantedTrade?.AccountType?.description,
      tradeline.accountTypeDescription,
      tradeline.accountTypeAbbreviation,
      tradeline.PayStatus?.description,
      'Negative Item',
    );
    const amount = parseNumber(tradeline.currentBalance)
      ?? parseNumber(tradeline.GrantedTrade?.amountPastDue)
      ?? parseNumber(tradeline.amountPastDue)
      ?? parseNumber(tradeline.highBalance)
      ?? 0;
    const dateReported = firstNonEmpty(
      tradeline.dateReported,
      tradeline.dateAccountStatus,
      tradeline.dateVerified,
      tradeline.Source?.InquiryDate,
      nowIso().slice(0, 10),
    ).slice(0, 10);

    const item = {
      id: `mfsn-${bureau}-${maskAccountNumber(tradeline.accountNumber)}-${creditor}-${dateReported}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      type,
      creditor,
      accountNumber: maskAccountNumber(tradeline.accountNumber),
      amount,
      dateReported,
      bureau: [bureau],
      status: 'Open' as const,
    };

    if (!seen.has(item.id)) {
      seen.add(item.id);
      items.push(item);
    }
  }

  return items;
}

function extractScoreValue(record: Record<string, any>): number | null {
  const directCandidates = [
    record.score,
    record.Score,
    record.scoreValue,
    record.ScoreValue,
    record.creditScore,
    record.CreditScore,
    record.riskScore,
    record.RiskScore,
    record.value,
    record.Value,
  ];

  for (const candidate of directCandidates) {
    const parsed = parseNumber(candidate);
    if (parsed != null && parsed >= 250 && parsed <= 900) return parsed;
  }

  for (const [key, value] of Object.entries(record)) {
    if (!/score/i.test(key)) continue;
    const parsed = parseNumber(value);
    if (parsed != null && parsed >= 250 && parsed <= 900) return parsed;
    if (isRecord(value)) {
      const nested = extractScoreValue(value);
      if (nested != null) return nested;
    }
  }

  return null;
}

function extractScoreSnapshot(report: unknown): ScoreSnapshot {
  const snapshot: ScoreSnapshot = { equifax: 0, experian: 0, transunion: 0 };

  walkRecords(report, (record) => {
    const bureau = normalizeBureau(
      firstNonEmpty(
        record.bureau,
        record.Bureau?.description,
        record.Bureau?.abbreviation,
        record.Source?.Bureau?.description,
        record.Source?.Bureau?.abbreviation,
      ),
    );
    if (!bureau) return;

    const score = extractScoreValue(record);
    if (score == null) return;

    if (bureau === 'Equifax' && !snapshot.equifax) snapshot.equifax = score;
    if (bureau === 'Experian' && !snapshot.experian) snapshot.experian = score;
    if (bureau === 'TransUnion' && !snapshot.transunion) snapshot.transunion = score;
  });

  return snapshot;
}

async function fetchMfsnReport(connection: ProviderConnectionRecord) {
  const memberUsername = readEncryptedString(connection.memberUsernameEnc);
  const memberPassword = readEncryptedString(connection.memberPasswordEnc);
  if (!memberUsername || !memberPassword) {
    throw new Error('MyFreeScoreNow member credentials are missing. Reconnect the provider.');
  }

  const accessToken = await getMfsnAccessToken(connection);
  const reportVariant = reportVariantFromConnection(connection);
  const endpoint = reportVariant === 'epic'
    ? '/api/auth/v2/3B/epic/report.json'
    : '/api/auth/3B/report.json';

  const { response, data } = await postJson(
    `${getMfsnBaseUrl()}${endpoint}`,
    { username: memberUsername, password: memberPassword },
    { Authorization: `Bearer ${accessToken}` },
  );

  if (!response.ok || data?.success === false) {
    const upstreamError = firstNonEmpty(data?.message, data?.error, data?.raw);
    throw new Error(upstreamError || `MyFreeScoreNow report request failed (${response.status}).`);
  }

  return {
    report: data?.data ?? data,
    reportVariant,
  };
}

async function syncMyFreeScoreNow(connection: ProviderConnectionRecord): Promise<MfsnSyncResult> {
  const { report, reportVariant } = await fetchMfsnReport(connection);
  const negativeItems = normalizeNegativeItems(report);
  const scoreSnapshot = extractScoreSnapshot(report);
  const importedScoreCount = Object.values(scoreSnapshot).filter((value) => value > 0).length;

  if (negativeItems.length === 0 && importedScoreCount === 0) {
    throw new Error('MyFreeScoreNow returned a report, but no tradelines or scores could be parsed.');
  }

  return { negativeItems, scoreSnapshot, reportVariant };
}

function headlineScore(snapshot: ScoreSnapshot): number {
  return snapshot.experian || snapshot.equifax || snapshot.transunion || 0;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientIp = getClientIp(req);
  const ipQuota = consumeRateLimit(`provider-sync-ip:${clientIp}`, 80, 60_000);
  if (!ipQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) return res.status(401).json({ error: 'Authentication required' });

  let companyId = '';

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const uidQuota = consumeRateLimit(`provider-sync:${decoded.uid}`, 20, 60_000);
    if (!uidQuota.allowed) return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });

    const userSnap = await getAdminDb().collection('users').doc(decoded.uid).get();
    if (!userSnap.exists) return res.status(403).json({ error: 'User profile not found' });

    const user = userSnap.data() as any;
    companyId = user.companyId || decoded.uid;

    const connectionRef = getAdminDb().collection('providerConnections').doc(companyId);
    const connSnap = await connectionRef.get();
    if (!connSnap.exists || connSnap.data()?.enabled !== true) {
      return res.status(409).json({ error: 'Provider not connected' });
    }

    const connection = connSnap.data() as ProviderConnectionRecord;
    if (connection.provider !== 'MyFreeScoreNow') {
      return res.status(501).json({ error: `${connection.provider || 'Selected provider'} live import is not wired yet.` });
    }

    const syncResult = await syncMyFreeScoreNow(connection);
    const now = nowIso();

    await getAdminDb().collection('creditReports').add({
      companyId,
      userId: decoded.uid,
      provider: connection.provider,
      reportAt: now,
      reportVariant: syncResult.reportVariant,
      summary: {
        totalNegativeItems: syncResult.negativeItems.length,
      },
      createdAt: now,
    });

    const scoreEntries = [
      { bureau: 'Equifax', score: syncResult.scoreSnapshot.equifax },
      { bureau: 'Experian', score: syncResult.scoreSnapshot.experian },
      { bureau: 'TransUnion', score: syncResult.scoreSnapshot.transunion },
    ].filter((entry) => entry.score > 0);

    await Promise.all(scoreEntries.map((entry) => (
      getAdminDb().collection('scores').add({
        companyId,
        userId: decoded.uid,
        bureau: entry.bureau,
        score: entry.score,
        capturedAt: now,
        createdAt: now,
      })
    )));

    await getAdminDb().collection('users').doc(decoded.uid).set({
      negativeItems: syncResult.negativeItems,
      creditScore: syncResult.scoreSnapshot,
      lastReportAnalysisAt: now,
      lastReportFileName: `myfreescorenow-${syncResult.reportVariant}-report.json`,
      lastReportSource: 'PROVIDER',
      lastNegativeItemCount: syncResult.negativeItems.length,
      updatedAt: now,
    }, { merge: true });

    await getAdminDb().collection('integrations').doc(`${companyId}:credit_provider`).set({
      id: 'credit_provider',
      companyId,
      status: 'CONNECTED',
      health: 100,
      lastSync: now,
      updatedAt: now,
    }, { merge: true });

    await connectionRef.set({
      lastError: null,
      lastSync: now,
      updatedAt: now,
    }, { merge: true });

    return res.status(200).json({
      ok: true,
      imported: {
        provider: connection.provider,
        reportVariant: syncResult.reportVariant,
        negativeItems: syncResult.negativeItems.length,
        score: headlineScore(syncResult.scoreSnapshot),
        scores: syncResult.scoreSnapshot,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Provider sync failed';
    if (companyId) {
      await getAdminDb().collection('providerConnections').doc(companyId).set({
        lastError: message,
        updatedAt: nowIso(),
      }, { merge: true }).catch(() => undefined);
    }
    console.error('api/provider-sync error:', err);
    return res.status(500).json({ error: message || 'Provider sync failed' });
  }
}
