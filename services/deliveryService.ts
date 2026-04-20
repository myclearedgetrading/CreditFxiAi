import { auth } from './firebaseConfig';

export type DeliveryChannel = 'MAIL' | 'FAX';

export async function sendDisputeRoundDelivery(payload: {
  companyId: string;
  clientId: string;
  disputeId: string;
  disputeRoundId: string;
  channel: DeliveryChannel;
  letterText: string;
  recipients: { label: string; address: string }[];
}) {
  const tokenProvider = auth?.currentUser?.getIdToken;
  if (typeof tokenProvider !== 'function') {
    throw new Error('You must be signed in to send dispute deliveries.');
  }
  const idToken = await tokenProvider.call(auth.currentUser);
  const res = await fetch('/api/delivery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ action: 'send', payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Delivery failed (${res.status})`);
  }
  return data as { ok: true; deliveryId: string; trackingId: string };
}

