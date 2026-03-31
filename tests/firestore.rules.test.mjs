import fs from 'node:fs';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'creditfix-security-firestore-tests';
const rules = fs.readFileSync('firestore.rules', 'utf8');

let testEnv;

async function seedUserDoc(userId, data) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', userId), data);
  });
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules },
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('firestore rules: users profile security', () => {
  test('owner can update safe profile fields', async () => {
    await seedUserDoc('userA', {
      id: 'userA',
      email: 'userA@example.com',
      role: 'USER',
      companyId: 'tenantA',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Abel',
      lastName: 'Melendez',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const db = testEnv.authenticatedContext('userA').firestore();
    const userRef = doc(db, 'users', 'userA');
    await assertSucceeds(updateDoc(userRef, { firstName: 'Abe' }));

    const updatedDoc = await getDoc(userRef);
    assert.equal(updatedDoc.data()?.firstName, 'Abe');
  });

  test('owner cannot self-promote role to ADMIN', async () => {
    await seedUserDoc('userRole', {
      id: 'userRole',
      email: 'role@example.com',
      role: 'USER',
      companyId: 'tenantA',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Role',
      lastName: 'User',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const db = testEnv.authenticatedContext('userRole').firestore();
    const userRef = doc(db, 'users', 'userRole');
    await assertFails(updateDoc(userRef, { role: 'ADMIN' }));
  });

  test('owner cannot change companyId to another tenant', async () => {
    await seedUserDoc('userTenant', {
      id: 'userTenant',
      email: 'tenant@example.com',
      role: 'USER',
      companyId: 'tenantA',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Tenant',
      lastName: 'User',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const db = testEnv.authenticatedContext('userTenant').firestore();
    const userRef = doc(db, 'users', 'userTenant');
    await assertFails(updateDoc(userRef, { companyId: 'tenantB' }));
  });

  test('platform admin can update another user role', async () => {
    await seedUserDoc('platformAdmin', {
      id: 'platformAdmin',
      email: 'admin@example.com',
      role: 'ADMIN',
      companyId: 'platform',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Admin',
      lastName: 'User',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    await seedUserDoc('targetUser', {
      id: 'targetUser',
      email: 'target@example.com',
      role: 'USER',
      companyId: 'tenantA',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Target',
      lastName: 'User',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const adminDb = testEnv.authenticatedContext('platformAdmin').firestore();
    const targetRef = doc(adminDb, 'users', 'targetUser');
    await assertSucceeds(updateDoc(targetRef, { role: 'SPECIALIST' }));
  });
});
