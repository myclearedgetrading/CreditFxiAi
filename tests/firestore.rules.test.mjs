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

describe('firestore rules: dispute workflow collections', () => {
  test('tenant member can create task in their company', async () => {
    await seedUserDoc('taskUserA', {
      id: 'taskUserA',
      email: 'taskA@example.com',
      role: 'USER',
      companyId: 'tenantA',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Task',
      lastName: 'UserA',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const db = testEnv.authenticatedContext('taskUserA').firestore();
    await assertSucceeds(setDoc(doc(db, 'tasks', 'task-1'), {
      companyId: 'tenantA',
      clientId: 'taskUserA',
      title: 'Send dispute round 1',
      description: 'Mail generated letter.',
      taskType: 'DISPUTE_SEND',
      status: 'OPEN',
      priorityLabel: 'HIGH',
      estimatedScoreImpact: 30,
      confidenceScoreImpact: 0.65,
      urgencyScore: 75,
      effortScore: 35,
      priorityScore: 60,
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    }));
  });

  test('tenant member cannot create task for different company', async () => {
    await seedUserDoc('taskUserB', {
      id: 'taskUserB',
      email: 'taskB@example.com',
      role: 'USER',
      companyId: 'tenantB',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Task',
      lastName: 'UserB',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const db = testEnv.authenticatedContext('taskUserB').firestore();
    await assertFails(setDoc(doc(db, 'tasks', 'task-2'), {
      companyId: 'tenantA',
      clientId: 'taskUserB',
      title: 'Cross tenant injection',
      description: 'Should be denied.',
      taskType: 'DISPUTE_SEND',
      status: 'OPEN',
      priorityLabel: 'HIGH',
      estimatedScoreImpact: 10,
      confidenceScoreImpact: 0.5,
      urgencyScore: 50,
      effortScore: 50,
      priorityScore: 25,
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    }));
  });

  test('tenant member cannot read another company dispute round', async () => {
    await seedUserDoc('readerA', {
      id: 'readerA',
      email: 'readerA@example.com',
      role: 'USER',
      companyId: 'tenantA',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Reader',
      lastName: 'A',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });
    await seedUserDoc('writerB', {
      id: 'writerB',
      email: 'writerB@example.com',
      role: 'USER',
      companyId: 'tenantB',
      createdAt: '2026-01-01T00:00:00.000Z',
      firstName: 'Writer',
      lastName: 'B',
      creditScore: { equifax: 0, experian: 0, transunion: 0 },
      negativeItems: [],
    });

    const writerDb = testEnv.authenticatedContext('writerB').firestore();
    await assertSucceeds(setDoc(doc(writerDb, 'disputeRounds', 'round-tenant-b'), {
      companyId: 'tenantB',
      clientId: 'writerB',
      disputeId: 'd1',
      roundNumber: 1,
      strategy: 'Factual Dispute',
      targetBureaus: ['Equifax'],
      status: 'SENT',
      outcome: 'PENDING',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    }));

    const readerDb = testEnv.authenticatedContext('readerA').firestore();
    await assertFails(getDoc(doc(readerDb, 'disputeRounds', 'round-tenant-b')));
  });
});
