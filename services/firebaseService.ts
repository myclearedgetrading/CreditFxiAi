
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, onSnapshot, Timestamp 
} from 'firebase/firestore';
import { 
  signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, googleProvider } from './firebaseConfig';
import { Client, SupportTicket, ActivityLog, User } from '../types';

/** Resolves tenant id for queries and writes (Path A). */
export const tenantCompanyId = (user: Pick<User, 'id' | 'companyId'>): string =>
  user.companyId || user.id;

/** DIY users without legacy `companyId` still map to their personal tenant. */
export const normalizeTenantUser = (u: User): User => {
  if (!u.companyId && u.id) {
    return { ...u, companyId: u.id };
  }
  return u;
};

export const isFirebaseAuthAvailable = (): boolean =>
  typeof auth?.onAuthStateChanged === 'function';

/** Minimal profile when Firestore has no `users/{uid}` doc yet (syncs with rules + DIY `companyId`). */
export const buildUserProfileFromAuthUser = (fbUser: FirebaseUser): User => {
  const parts = (fbUser.displayName || '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    firstName,
    lastName,
    phone: fbUser.phoneNumber || '',
    role: 'USER',
    companyId: fbUser.uid,
    creditScore: { equifax: 0, experian: 0, transunion: 0 },
    negativeItems: [],
  };
};

// --- AUTHENTICATION & USER MANAGEMENT ---

export const registerWithEmail = async (email: string, pass: string, userData: Partial<User>) => {
  if (!auth.app) throw new Error("Firebase Auth not configured");
  
  // 1. Create Auth User
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = credential.user.uid;

  // 2. Create User Document in Firestore
  const merged = userData as User;
  const userProfile: User = {
    ...merged,
    id: uid,
    email,
    role: merged.role || 'USER',
    companyId: merged.companyId ?? uid,
  };

  await saveUserToFirestore(userProfile);
  return userProfile;
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Check if user doc exists, if not, could create one (optional logic)
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  if (!auth.app) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
  if (auth.app) {
    await signOut(auth);
  }
};

export const saveUserToFirestore = async (user: User) => {
  if (!db.app) return;
  await setDoc(doc(db, 'users', user.id), normalizeTenantUser(user));
};

export const getUserFromFirestore = async (uid: string): Promise<User | null> => {
  if (!db.app) return null;
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return normalizeTenantUser(docSnap.data() as User);
  }
  return null;
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth.app) return () => {};
  return onAuthStateChanged(auth, callback);
};

// --- CLIENTS ---

export const getClients = async (companyId: string): Promise<Client[]> => {
  if (!db.app) return [];
  const q = query(collection(db, 'clients'), where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

/** Create a client under the given tenant (`companyId`). */
export const createClient = async (companyId: string, clientData: Partial<Client>) => {
  if (!db.app) throw new Error("Database not configured");
  return await addDoc(collection(db, 'clients'), {
    ...clientData,
    companyId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

export const updateClient = async (clientId: string, data: Partial<Client>) => {
  if (!db.app) throw new Error("Database not configured");
  const ref = doc(db, 'clients', clientId);
  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

// --- DISPUTES ---

export const createDispute = async (companyId: string, disputeData: Record<string, unknown>) => {
  if (!db.app) return { id: 'mock-id' };
  return await addDoc(collection(db, 'disputes'), {
    ...disputeData,
    companyId,
    status: 'DRAFT',
    createdAt: Timestamp.now()
  });
};

export const getClientDisputes = async (companyId: string, clientId: string) => {
  if (!db.app) return [];
  const q = query(
    collection(db, 'disputes'),
    where('companyId', '==', companyId),
    where('clientId', '==', clientId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- SUPPORT TICKETS ---

export const createTicket = async (companyId: string, ticket: Partial<SupportTicket>) => {
  if (!db.app) return { id: 'mock-ticket-id' };
  return await addDoc(collection(db, 'tickets'), {
    ...ticket,
    companyId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: ticket.status || 'OPEN'
  });
};

export const subscribeToTickets = (
  companyId: string,
  callback: (tickets: SupportTicket[]) => void
) => {
  if (!db.app) return () => {};
  const q = query(
    collection(db, 'tickets'),
    where('companyId', '==', companyId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
    callback(tickets);
  });
};

// --- STORAGE ---

export const uploadDocument = async (file: File, path: string) => {
  if (!storage.app) return "https://via.placeholder.com/150";
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// --- LOGGING ---

export const logActivity = async (companyId: string, log: Partial<ActivityLog>) => {
  if (!db.app) return;
  await addDoc(collection(db, 'activityLogs'), {
    ...log,
    companyId,
    timestamp: Timestamp.now()
  });
};
