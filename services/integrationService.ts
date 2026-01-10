import { Integration, WebhookEvent } from "../types";

// Mock Database of Integrations
const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'identity-iq',
    name: 'IdentityIQ',
    category: 'CREDIT_BUREAU',
    description: 'Import 3-bureau credit reports and monitoring alerts automatically.',
    status: 'CONNECTED',
    icon: 'Shield',
    lastSync: '10 mins ago',
    health: 98,
    requiresOAuth: false
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    category: 'PAYMENT',
    description: 'Process subscriptions, one-time payments, and handle invoices.',
    status: 'CONNECTED',
    icon: 'CreditCard',
    lastSync: 'Just now',
    health: 100,
    requiresOAuth: true
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    category: 'COMMUNICATION',
    description: 'Send SMS updates and two-factor authentication codes.',
    status: 'DISCONNECTED',
    icon: 'MessageCircle',
    health: 0,
    requiresOAuth: false
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    category: 'DOCUMENT',
    description: 'Send contracts and power of attorney documents for e-signature.',
    status: 'DISCONNECTED',
    icon: 'FileSignature',
    health: 0,
    requiresOAuth: true
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'COMMUNICATION',
    description: 'Transactional email service for notifications and campaigns.',
    status: 'CONNECTED',
    icon: 'Mail',
    lastSync: '1 hour ago',
    health: 95,
    requiresOAuth: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'MARKETING',
    description: 'Connect to 5,000+ apps for custom workflows.',
    status: 'DISCONNECTED',
    icon: 'Zap',
    health: 0,
    requiresOAuth: true
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'ACCOUNTING',
    description: 'Sync invoices and payments for automated bookkeeping.',
    status: 'DISCONNECTED',
    icon: 'FileSpreadsheet',
    health: 0,
    requiresOAuth: true
  },
  {
    id: 'smartcredit',
    name: 'SmartCredit',
    category: 'CREDIT_BUREAU',
    description: 'Alternative credit monitoring integration.',
    status: 'DISCONNECTED',
    icon: 'ShieldCheck',
    health: 0,
    requiresOAuth: false
  }
];

const MOCK_WEBHOOKS: WebhookEvent[] = [
  { id: 'wh_1', source: 'Stripe', event: 'payment.succeeded', timestamp: '2 mins ago', status: 'PROCESSED', payload: { amount: 9900, currency: 'usd' } },
  { id: 'wh_2', source: 'IdentityIQ', event: 'report.updated', timestamp: '15 mins ago', status: 'PROCESSED', payload: { clientId: '104', changes: 3 } },
  { id: 'wh_3', source: 'Twilio', event: 'sms.failed', timestamp: '1 hour ago', status: 'FAILED', payload: { error: 'Invalid number' } },
  { id: 'wh_4', source: 'SendGrid', event: 'email.opened', timestamp: '2 hours ago', status: 'PROCESSED', payload: { campaignId: 'cmp_55' } },
];

export const getIntegrations = async (): Promise<Integration[]> => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(MOCK_INTEGRATIONS), 500));
};

export const getWebhookLogs = async (): Promise<WebhookEvent[]> => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_WEBHOOKS), 500));
};

export const connectIntegration = async (id: string, credentials?: any): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate connection logic
      console.log(`Connecting to ${id}...`, credentials);
      resolve(true);
    }, 1500);
  });
};

export const disconnectIntegration = async (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Disconnecting ${id}...`);
      resolve(true);
    }, 1000);
  });
};

export const syncIntegration = async (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Syncing ${id}...`);
      resolve(true);
    }, 2000);
  });
};
