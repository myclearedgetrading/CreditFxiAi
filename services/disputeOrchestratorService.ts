import { auth } from './firebaseConfig';

export interface OrchestratorRequest {
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
}

export const runDisputeOrchestration = async (payload: OrchestratorRequest) => {
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') {
    throw new Error('You must be signed in to orchestrate disputes.');
  }
  const idToken = await tokenProvider.call(auth.currentUser);

  const res = await fetch('/api/dispute-orchestrator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Orchestration failed (${res.status})`);
  }
  return data as {
    orchestration: {
      parsedResponse: { summary: string; confidence: number };
      workflow: { nextActions: { label: string; rationale: string; urgency: number }[]; nextStatus: string };
      scoreImpact: { bestCase: number; likelyCase: number; worstCase: number };
      template: { subject: string; body: string; checklist: string[] };
    };
    nextRoundNumber: number;
  };
};
