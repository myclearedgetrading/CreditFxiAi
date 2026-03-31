import { dispatchGeminiAction } from './lib/geminiCore';
import { extractBearerToken, getAdminAuth, getAdminDb } from './lib/firebaseAdmin';
import { consumeRateLimit } from './lib/rateLimit';

/**
 * Vercel serverless: POST { action: string, payload: unknown } -> { result: unknown }
 * Set API_KEY or GEMINI_API_KEY in the Vercel project environment (not VITE_*).
 */
type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (n: number) => { json: (b: unknown) => void };
};

const ALLOWED_ACTIONS = new Set([
  'generateDisputeLetter',
  'analyzeCreditReportHTML',
  'analyzeCreditReportImage',
  'generateFundingPlan',
  'predictDisputeOutcome',
  'forecastCreditScore',
  'generateEducationalContent',
  'generateTutorResponse',
  'generateQuiz',
  'analyzeInboundEmail',
  'suggestAutomationWorkflow',
  'classifyDocument',
  'parseBureauResponse',
  'generateExecutiveSummary',
  'generateChatResponse',
  'analyzeSupportTicket',
]);

function getHeader(req: ApiRequest, key: string): string | undefined {
  const value = req.headers?.[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function getClientIp(req: ApiRequest): string {
  const forwardedFor = getHeader(req, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function validatePayload(action: string, payload: unknown): string | null {
  if (action === 'analyzeCreditReportHTML') {
    if (typeof payload !== 'string' || payload.length < 50 || payload.length > 350000) {
      return 'Invalid payload for analyzeCreditReportHTML';
    }
  }

  if (action === 'analyzeCreditReportImage') {
    const imagePayload = payload as { base64Image?: string; mimeType?: string } | null;
    const mimeType = imagePayload?.mimeType || '';
    if (
      typeof imagePayload?.base64Image !== 'string'
      || imagePayload.base64Image.length < 50
      || imagePayload.base64Image.length > 10_000_000
      || (mimeType !== 'image/jpeg' && mimeType !== 'image/png' && mimeType !== 'image/webp')
    ) {
      return 'Invalid payload for analyzeCreditReportImage';
    }
  }

  if (action === 'generateChatResponse') {
    const chatPayload = payload as { history?: unknown[]; userMessage?: string } | null;
    if (
      typeof chatPayload?.userMessage !== 'string'
      || chatPayload.userMessage.trim().length < 1
      || chatPayload.userMessage.length > 4000
      || (chatPayload.history && !Array.isArray(chatPayload.history))
      || (Array.isArray(chatPayload.history) && chatPayload.history.length > 50)
    ) {
      return 'Invalid payload for generateChatResponse';
    }
  }

  return null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const body = req.body as { action?: string; payload?: unknown } | undefined;
  const action = body?.action;
  if (!action || typeof action !== 'string' || !ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Missing action' });
  }

  const payloadError = validatePayload(action, body.payload);
  if (payloadError) {
    return res.status(400).json({ error: payloadError });
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User profile not found' });
    }

    const clientIp = getClientIp(req);
    const uidQuota = consumeRateLimit(`gemini:${decoded.uid}`, 30, 60_000);
    if (!uidQuota.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
    }
    const ipQuota = consumeRateLimit(`gemini-ip:${clientIp}`, 100, 60_000);
    if (!ipQuota.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
    }

    res.setHeader('X-RateLimit-Remaining', String(Math.min(uidQuota.remaining, ipQuota.remaining)));
    const result = await dispatchGeminiAction(action, body.payload);
    return res.status(200).json({ result });
  } catch (err: unknown) {
    console.error('api/gemini error:', err);
    return res.status(500).json({ error: 'AI request failed' });
  }
}
