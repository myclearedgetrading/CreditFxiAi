import { dispatchGeminiAction } from './lib/geminiCore';
import { extractBearerToken, getAdminAuth, getAdminDb } from './lib/firebaseAdmin';
import { consumeRateLimit } from './lib/rateLimit';

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

type ApiResponse = {
  status: (n: number) => { json: (b: unknown) => void };
};

type OrchestratorPayload = {
  disputeId: string;
  companyId: string;
  clientId: string;
  disputeRoundId: string;
  currentStatus: 'DRAFT' | 'SENT' | 'RESPONDED' | 'ESCALATED' | 'CLOSED';
  currentRoundNumber: number;
  responseText: string;
  bureau?: string;
  furnisher?: string;
  currentScore: number;
  negativeItemsRemaining: number;
  strategy: string;
  clientName: string;
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SENT'],
  SENT: ['RESPONDED', 'ESCALATED', 'CLOSED'],
  RESPONDED: ['SENT', 'ESCALATED', 'CLOSED'],
  ESCALATED: ['SENT', 'CLOSED'],
  CLOSED: [],
};

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

export function validatePayload(payload: unknown): payload is OrchestratorPayload {
  const p = payload as Partial<OrchestratorPayload>;
  return (
    typeof p.disputeId === 'string'
    && typeof p.companyId === 'string'
    && typeof p.clientId === 'string'
    && typeof p.disputeRoundId === 'string'
    && typeof p.currentStatus === 'string'
    && typeof p.currentRoundNumber === 'number'
    && p.currentRoundNumber >= 1
    && p.currentRoundNumber <= 6
    && typeof p.responseText === 'string'
    && p.responseText.length >= 50
    && p.responseText.length <= 350000
    && typeof p.currentScore === 'number'
    && p.currentScore >= 300
    && p.currentScore <= 850
    && typeof p.negativeItemsRemaining === 'number'
    && typeof p.strategy === 'string'
    && typeof p.clientName === 'string'
  );
}

export function assertLegalTransition(currentStatus: string, nextStatus: string) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(`ILLEGAL_TRANSITION:${currentStatus}->${nextStatus}`);
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const idToken = extractBearerToken(getHeader(req, 'authorization'));
  if (!idToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!validatePayload(req.body)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const payload = req.body as OrchestratorPayload;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User profile not found' });
    }
    const userCompanyId = userDoc.data()?.companyId;
    if (userCompanyId !== payload.companyId) {
      return res.status(403).json({ error: 'Tenant mismatch' });
    }

    const clientIp = getClientIp(req);
    const uidQuota = consumeRateLimit(`orchestrator:${decoded.uid}`, 20, 60_000);
    const ipQuota = consumeRateLimit(`orchestrator-ip:${clientIp}`, 80, 60_000);
    if (!uidQuota.allowed || !ipQuota.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
    }

    const orchestration = await dispatchGeminiAction('orchestrateClosedLoopCreditRepair', {
      responseText: payload.responseText,
      bureau: payload.bureau,
      furnisher: payload.furnisher,
      currentRoundNumber: payload.currentRoundNumber,
      status: payload.currentStatus,
      currentScore: payload.currentScore,
      negativeItemsRemaining: payload.negativeItemsRemaining,
      strategy: payload.strategy,
      clientName: payload.clientName,
    }) as {
      parsedResponse: {
        summary: string;
        confidence: number;
        outcomes: { bureau: string; creditor: string; accountNumber: string; outcome: string }[];
      };
      workflow: {
        nextStatus: string;
        shouldAdvanceRound: boolean;
        nextActions: { type: string; label: string; rationale: string; urgency: number }[];
      };
      scoreImpact: { likelyCase: number; bestCase: number; worstCase: number };
      template: { subject: string; body: string; checklist: string[] };
    };

    assertLegalTransition(payload.currentStatus, orchestration.workflow.nextStatus);

    const db = getAdminDb();
    const now = new Date().toISOString();
    const nextRoundNumber = payload.currentRoundNumber + (orchestration.workflow.shouldAdvanceRound ? 1 : 0);

    await db.collection('responseIngestions').add({
      companyId: payload.companyId,
      clientId: payload.clientId,
      disputeId: payload.disputeId,
      disputeRoundId: payload.disputeRoundId,
      source: 'UPLOAD',
      fileName: 'response-upload',
      mimeType: 'text/plain',
      ocrStatus: 'SUCCESS',
      parseStatus: 'SUCCESS',
      parseConfidence: orchestration.parsedResponse.confidence || 0,
      summary: orchestration.parsedResponse.summary,
      outcomes: orchestration.parsedResponse.outcomes || [],
      errors: [],
      processedAt: now,
      createdAt: now,
    });

    await db.collection('disputes').doc(payload.disputeId).set({
      companyId: payload.companyId,
      clientId: payload.clientId,
      currentRoundNumber: nextRoundNumber,
      overallStatus: orchestration.workflow.nextStatus,
      outcome: orchestration.workflow.nextStatus === 'CLOSED' ? 'PARTIAL' : 'PENDING',
      estimatedScoreImpact: orchestration.scoreImpact.likelyCase || 0,
      nextAction: orchestration.workflow.nextActions?.[0]?.label || 'Review dispute recommendations',
      nextActionDueAt: now,
      updatedAt: now,
    }, { merge: true });

    await db.collection('disputeRounds').doc(payload.disputeRoundId).set({
      companyId: payload.companyId,
      clientId: payload.clientId,
      disputeId: payload.disputeId,
      roundNumber: payload.currentRoundNumber,
      status: 'RESPONSE_RECEIVED',
      responseReceivedAt: now,
      outcome: orchestration.workflow.nextStatus === 'CLOSED' ? 'PARTIAL' : 'PENDING',
      summary: orchestration.parsedResponse.summary,
      updatedAt: now,
    }, { merge: true });

    if (orchestration.workflow.shouldAdvanceRound) {
      await db.collection('disputeRounds').add({
        companyId: payload.companyId,
        clientId: payload.clientId,
        disputeId: payload.disputeId,
        roundNumber: payload.currentRoundNumber + 1,
        strategy: payload.strategy,
        targetBureaus: payload.bureau ? [payload.bureau] : [],
        status: 'READY_TO_SEND',
        outcome: 'PENDING',
        generatedLetter: orchestration.template?.body || '',
        summary: 'Next round prepared from response analysis.',
        createdAt: now,
        updatedAt: now,
      });
    }

    const taskSeed = (orchestration.workflow.nextActions || []).slice(0, 3);
    await Promise.all(taskSeed.map((task) => db.collection('tasks').add({
      companyId: payload.companyId,
      clientId: payload.clientId,
      disputeId: payload.disputeId,
      disputeRoundId: payload.disputeRoundId,
      title: task.label,
      description: task.rationale,
      taskType: 'DISPUTE_FOLLOW_UP',
      status: 'OPEN',
      priorityLabel: task.urgency >= 80 ? 'CRITICAL' : task.urgency >= 60 ? 'HIGH' : 'MEDIUM',
      estimatedScoreImpact: Math.max(5, Math.round((orchestration.scoreImpact?.likelyCase || 0) / 2)),
      confidenceScoreImpact: Math.min(1, Math.max(0.1, (orchestration.parsedResponse?.confidence || 50) / 100)),
      urgencyScore: task.urgency,
      effortScore: 35,
      priorityScore: task.urgency,
      linkedEntityType: 'DISPUTE_ROUND',
      linkedEntityId: payload.disputeRoundId,
      createdAt: now,
      updatedAt: now,
    })));

    return res.status(200).json({
      orchestration,
      nextRoundNumber,
    });
  } catch (err: unknown) {
    console.error('api/dispute-orchestrator error:', err);
    const message = err instanceof Error ? err.message : 'Orchestration failed';
    if (message.startsWith('ILLEGAL_TRANSITION')) {
      return res.status(409).json({ error: message });
    }
    return res.status(500).json({ error: 'Orchestration failed' });
  }
}
