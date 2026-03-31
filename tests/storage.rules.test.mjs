import fs from 'node:fs';
import { after, before, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';

const PROJECT_ID = 'creditfix-security-storage-tests';
const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
const storageRules = fs.readFileSync('storage.rules', 'utf8');

let testEnv;

async function seedUserDoc(userId, companyId) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', userId), {
      id: userId,
      email: `${userId}@example.com`,
      role: 'USER',
      companyId,
      createdAt: '2026-01-01T00:00:00.000Z',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });
  });
}

function storageForUser(uid) {
  const companyId = uid.startsWith('companyA') ? 'companyA' : uid.startsWith('companyB') ? 'companyB' : uid;
  return testEnv
    .authenticatedContext(uid, { companyId })
    .storage(`gs://${PROJECT_ID}.appspot.com`);
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: firestoreRules },
    storage: { rules: storageRules },
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('storage rules: tenant document isolation', () => {
  test('company member can upload and read own tenant document', async () => {
    await seedUserDoc('companyAUser', 'companyA');

    const storage = storageForUser('companyAUser');
    const fileRef = storage.ref('companies/companyA/clients/client1/documents/report.pdf');

    await assertSucceeds(
      fileRef.putString('test-report', 'raw', {
        contentType: 'application/pdf',
      })
    );
    await assertSucceeds(fileRef.getDownloadURL());
  });

  test('user from another company cannot read cross-tenant document', async () => {
    await seedUserDoc('companyAOwner', 'companyA');
    await seedUserDoc('companyBUser', 'companyB');

    const ownerStorage = storageForUser('companyAOwner');
    const crossTenantRef = ownerStorage.ref('companies/companyA/clients/client2/documents/statement.pdf');
    await assertSucceeds(
      crossTenantRef.putString('tenant-a-doc', 'raw', {
        contentType: 'application/pdf',
      })
    );

    const attackerStorage = storageForUser('companyBUser');
    const attackerRef = attackerStorage.ref('companies/companyA/clients/client2/documents/statement.pdf');
    await assertFails(attackerRef.getDownloadURL());
  });
});
