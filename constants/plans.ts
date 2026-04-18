/** Launch pricing — display only; billing integration wires `subscriptionTier` on the user profile. */
export const PLAN_PRICES = {
  DIY_PRO_MONTHLY_USD: 39,
  AGENCY_MONTHLY_USD: 99,
} as const;

export const PLAN_COPY = {
  free: {
    name: 'Free',
    priceLabel: '$0',
    blurb: 'Education and one dispute letter — no AI credit report analysis.',
  },
  diyPro: {
    name: 'DIY Pro',
    priceLabel: `$${PLAN_PRICES.DIY_PRO_MONTHLY_USD}/mo`,
    blurb: 'Full AI report analysis, unlimited disputes, progress tracking, and education.',
  },
  agency: {
    name: 'Agency',
    priceLabel: `$${PLAN_PRICES.AGENCY_MONTHLY_USD}/mo`,
    blurb: 'Multi-client CRM, full feature set, and team workflows.',
  },
} as const;
