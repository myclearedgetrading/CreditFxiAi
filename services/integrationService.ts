
import { Integration, WebhookEvent } from "../types";
import { auth } from './firebaseConfig';

export type CreditProviderId = 'SmartCredit' | 'MyFreeScoreNow';
export type MyFreeScoreNowReportVariant = 'standard' | 'epic';

export type CreditProviderConnectPayload = {
  provider: CreditProviderId;
  accessToken?: string;
  externalUserId?: string;
  memberUsername?: string;
  memberPassword?: string;
  apiAccessEmail?: string;
  apiAccessPassword?: string;
  reportVariant?: MyFreeScoreNowReportVariant;
};

export const getIntegrations = async (): Promise<Integration[]> => {
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') return [];
  const idToken = await tokenProvider.call(auth.currentUser);
  const res = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ action: 'list' }),
  });
  const data = (await res.json().catch(() => ({}))) as { integrations?: Integration[]; error?: string };
  if (!res.ok) throw new Error(data.error || `Integrations request failed (${res.status})`);
  return data.integrations || [];
};

export const getWebhookLogs = async (): Promise<WebhookEvent[]> => {
  // Reserved for future: show provider/delivery webhook events.
  return [];
};

export const connectIntegration = async (id: string, credentials?: any): Promise<boolean> => {
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') throw new Error('You must be signed in to connect integrations.');
  const idToken = await tokenProvider.call(auth.currentUser);
  const res = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ action: 'connect', integrationId: id, payload: credentials || {} }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error || `Connect failed (${res.status})`);
  return Boolean(data.ok);
};

export const disconnectIntegration = async (id: string): Promise<boolean> => {
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') throw new Error('You must be signed in to disconnect integrations.');
  const idToken = await tokenProvider.call(auth.currentUser);
  const res = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ action: 'disconnect', integrationId: id }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error || `Disconnect failed (${res.status})`);
  return Boolean(data.ok);
};

export const syncIntegration = async (id: string): Promise<boolean> => {
  if (id === 'credit_provider') {
    const data = await fetchCreditReport('credit_provider', {});
    return Boolean(data?.ok);
  }
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') throw new Error('You must be signed in to sync integrations.');
  const idToken = await tokenProvider.call(auth.currentUser);
  const res = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ action: 'sync', integrationId: id }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error || `Sync failed (${res.status})`);
  return Boolean(data.ok);
};

export const fetchCreditReport = async (provider: string, credentials: any): Promise<any> => {
  // This is a legacy helper used by the UI; route real provider sync through `/api/provider-sync`.
  void provider;
  void credentials;
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') throw new Error('You must be signed in to sync provider data.');
  const idToken = await tokenProvider.call(auth.currentUser);
  const res = await fetch('/api/provider-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Provider sync failed (${res.status})`);
  return data;
};
