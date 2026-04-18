/**
 * Credit monitoring partners — only SmartCredit and MyFreeScoreNow are supported in-product.
 * SmartCredit uses the affiliate join URL; MyFreeScoreNow uses the main site (add ?pid= when you have one).
 */
export const CREDIT_MONITORING_AFFILIATE_URLS = {
  SmartCredit: 'https://www.smartcredit.com/join/?pid=71680',
  MyFreeScoreNow: 'https://www.myfreescorenow.com',
} as const;

export type CreditMonitoringProvider = keyof typeof CREDIT_MONITORING_AFFILIATE_URLS;

export const CREDIT_MONITORING_PROVIDER_IDS = Object.keys(
  CREDIT_MONITORING_AFFILIATE_URLS
) as CreditMonitoringProvider[];

export function getCreditMonitoringAffiliateUrl(provider: CreditMonitoringProvider): string {
  return CREDIT_MONITORING_AFFILIATE_URLS[provider];
}

/** Cards for “I need a report” / affiliate grids */
export const CREDIT_MONITORING_PROVIDER_CARDS: {
  id: CreditMonitoringProvider;
  offer: string;
  desc: string;
  color: string;
  hoverColor: string;
}[] = [
  {
    id: 'SmartCredit',
    offer: 'Join via partner',
    desc: '3-bureau monitoring and score tracking',
    color: 'text-green-400',
    hoverColor: 'hover:border-green-500/30 hover:shadow-green-500/10',
  },
  {
    id: 'MyFreeScoreNow',
    offer: 'Free trial',
    desc: 'Score updates and report access',
    color: 'text-red-400',
    hoverColor: 'hover:border-red-500/30 hover:shadow-red-500/10',
  },
];
