import type { User } from '../types';

/**
 * Resolved plan for gating (legacy `PRO` maps to DIY Pro; legacy `FREE` maps to unpaid).
 * Pay-to-play: only `DIY_PRO` and `AGENCY` unlock the product; `NONE` = signed in, not subscribed.
 */
export type PlanTier = 'NONE' | 'DIY_PRO' | 'AGENCY';

export function getEffectiveTier(user: User | null | undefined): PlanTier {
  if (!user?.id) return 'NONE';
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'AGENCY';

  const raw = user.subscriptionTier || 'NONE';
  if (raw === 'AGENCY') return 'AGENCY';
  if (raw === 'DIY_PRO' || raw === 'PRO') return 'DIY_PRO';
  /** Legacy free tier / unpaid */
  if (raw === 'FREE' || raw === 'NONE') return 'NONE';
  return 'NONE';
}

/** Gemini credit report analysis — DIY Pro and Agency only. */
export function canUseAiCreditAnalysis(user: User | null | undefined): boolean {
  const tier = getEffectiveTier(user);
  return tier === 'DIY_PRO' || tier === 'AGENCY';
}

/** Progress Tracker / AI coach summaries that call Gemini. */
export function canUseProgressTracking(user: User | null | undefined): boolean {
  return canUseAiCreditAnalysis(user);
}

/** DIY Pro or Agency — active subscription. */
export function isDiyProOrAgency(user: User | null | undefined): boolean {
  const t = getEffectiveTier(user);
  return t === 'DIY_PRO' || t === 'AGENCY';
}

/** Education Hub — paid subscribers only. */
export function canAccessEducationHub(user: User | null | undefined): boolean {
  return isDiyProOrAgency(user);
}

export function getDisputeLetterLimit(user: User | null | undefined): number {
  return isDiyProOrAgency(user) ? Number.POSITIVE_INFINITY : 0;
}

export function getDisputeLettersUsed(user: User | null | undefined): number {
  return Math.max(0, user?.disputeLettersGeneratedCount ?? 0);
}

export function canGenerateAnotherDisputeLetter(user: User | null | undefined): boolean {
  if (!user?.id) return false;
  if (!isDiyProOrAgency(user)) return false;
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

/** @deprecated Use isDiyProOrAgency or getEffectiveTier */
export function hasProSubscription(user: User | null | undefined): boolean {
  return isDiyProOrAgency(user);
}

/** @deprecated Use canGenerateAnotherDisputeLetter */
export function canGenerateDisputeLetters(user: User | null | undefined): boolean {
  return Boolean(user?.id) && isDiyProOrAgency(user);
}
