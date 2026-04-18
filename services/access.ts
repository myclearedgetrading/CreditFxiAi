import type { User } from '../types';

/** Resolved plan for gating (legacy `PRO` maps to DIY Pro). */
export type PlanTier = 'FREE' | 'DIY_PRO' | 'AGENCY';

export function getEffectiveTier(user: User | null | undefined): PlanTier {
  if (!user?.id) return 'FREE';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'AGENCY';

  const raw = user.subscriptionTier || 'FREE';
  if (raw === 'AGENCY') return 'AGENCY';
  if (raw === 'DIY_PRO' || raw === 'PRO') return 'DIY_PRO';
  return 'FREE';
}

/** Gemini credit report analysis (PDF/image/HTML) — not available on Free. */
export function canUseAiCreditAnalysis(user: User | null | undefined): boolean {
  const tier = getEffectiveTier(user);
  return tier === 'DIY_PRO' || tier === 'AGENCY';
}

/** Progress Tracker / AI coach summaries that call Gemini. */
export function canUseProgressTracking(user: User | null | undefined): boolean {
  return canUseAiCreditAnalysis(user);
}

/** Education Hub — all signed-in users. */
export function canAccessEducationHub(user: User | null | undefined): boolean {
  return Boolean(user?.id);
}

export function getDisputeLetterLimit(user: User | null | undefined): number {
  return getEffectiveTier(user) === 'FREE' ? 1 : Number.POSITIVE_INFINITY;
}

export function getDisputeLettersUsed(user: User | null | undefined): number {
  return Math.max(0, user?.disputeLettersGeneratedCount ?? 0);
}

export function canGenerateAnotherDisputeLetter(user: User | null | undefined): boolean {
  if (!user?.id) return false;
  const limit = getDisputeLetterLimit(user);
  if (!Number.isFinite(limit)) return true;
  return getDisputeLettersUsed(user) < limit;
}

export function isAgencyPlan(user: User | null | undefined): boolean {
  return getEffectiveTier(user) === 'AGENCY';
}

/** Multi-client CRM surfaces (Clients page, etc.). */
export function canAccessAgencyCrm(user: User | null | undefined): boolean {
  return isAgencyPlan(user);
}

/** DIY Pro or Agency — paid DIY experience (not Free). */
export function isDiyProOrAgency(user: User | null | undefined): boolean {
  const t = getEffectiveTier(user);
  return t === 'DIY_PRO' || t === 'AGENCY';
}

/** @deprecated Use isDiyProOrAgency or getEffectiveTier */
export function hasProSubscription(user: User | null | undefined): boolean {
  return isDiyProOrAgency(user);
}

/** @deprecated Use canGenerateAnotherDisputeLetter + signed-in check */
export function canGenerateDisputeLetters(user: User | null | undefined): boolean {
  return Boolean(user?.id);
}
