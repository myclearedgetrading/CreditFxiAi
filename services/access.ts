import type { User } from '../types';

/** Core DIY loop: any signed-in user can generate dispute letters (no subscription gate). */
export function canGenerateDisputeLetters(user: User | null | undefined): boolean {
  return Boolean(user?.id);
}

/** Paid / trial / admin — used for Pro badge, upsells, and optional premium-only UI. */
export function hasProSubscription(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === 'ADMIN'
    || user.role === 'SUPER_ADMIN'
    || user.subscriptionTier === 'PRO'
    || user.subscriptionStatus === 'ACTIVE'
    || user.subscriptionStatus === 'TRIAL'
  );
}
