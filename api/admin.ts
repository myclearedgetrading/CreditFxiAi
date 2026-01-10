import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
// Note: Requires service account credentials in environment variables
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')),
  });
}

const db = getFirestore();
const auth = getAuth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Secure this endpoint - verify ID token from client
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if requester is an admin
    const requesterDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (requesterDoc.data()?.role !== 'ADMIN' && requesterDoc.data()?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { email, password, role, companyId, displayName } = req.body;

    // Create new user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    // Set Custom Claims for Role
    await auth.setCustomUserClaims(userRecord.uid, { role, companyId });

    // Create User Document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      companyId,
      displayName,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ uid: userRecord.uid, message: 'User created successfully' });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: error.message });
  }
}