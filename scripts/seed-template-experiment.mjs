import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const companyId = process.argv[2];

if (!companyId) {
  console.error('Usage: npm run seed:template-experiment -- <companyId>');
  process.exit(1);
}

if (!serviceAccountRaw) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY is required.');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountRaw);
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const now = new Date().toISOString();

const templateARef = await db.collection('disputeTemplates').add({
  companyId,
  name: 'Metro2 Round1 Variant A',
  strategy: 'Metro 2 Compliance Challenge',
  roundType: 'INITIAL',
  bureau: 'ANY',
  content: 'Template A baseline body.',
  version: 1,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

const templateBRef = await db.collection('disputeTemplates').add({
  companyId,
  name: 'Metro2 Round1 Variant B',
  strategy: 'Metro 2 Compliance Challenge',
  roundType: 'INITIAL',
  bureau: 'ANY',
  content: 'Template B variation body.',
  version: 1,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

await db.collection('templateExperiments').add({
  companyId,
  name: 'Metro2 Round1 A/B',
  goalMetric: 'DELETE_RATE',
  status: 'RUNNING',
  variants: [
    { variantId: 'A', templateId: templateARef.id, trafficPct: 50 },
    { variantId: 'B', templateId: templateBRef.id, trafficPct: 50 },
  ],
  startAt: now,
  createdAt: now,
});

console.log(`Seeded baseline templates and running experiment for companyId=${companyId}`);
