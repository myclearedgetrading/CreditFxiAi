import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, onSnapshot, Timestamp 
} from 'firebase/firestore';
import { 
  signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, googleProvider } from './firebaseConfig';
import { Client, SupportTicket, ActivityLog } from '../types';

// --- AUTHENTICATION ---

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  // Check if auth is initialized (mock object has no 'app' property)
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

export const createClient = async (clientData: Partial<Client>) => {
  if (!db.app) throw new Error("Database not configured");
  return await addDoc(collection(db, 'clients'), {
    ...clientData,
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

export const createDispute = async (disputeData: any) => {
  if (!db.app) return { id: 'mock-id' };
  return await addDoc(collection(db, 'disputes'), {
    ...disputeData,
    status: 'DRAFT',
    createdAt: Timestamp.now()
  });
};

export const getClientDisputes = async (clientId: string) => {
  if (!db.app) return [];
  const q = query(collection(db, 'disputes'), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- SUPPORT TICKETS ---

export const createTicket = async (ticket: Partial<SupportTicket>) => {
  if (!db.app) return { id: 'mock-ticket-id' };
  return await addDoc(collection(db, 'tickets'), {
    ...ticket,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: 'OPEN'
  });
};

export const subscribeToTickets = (callback: (tickets: SupportTicket[]) => void) => {
  if (!db.app) return () => {};
  const q = query(collection(db, 'tickets'), orderBy('updatedAt', 'desc'));
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

export const logActivity = async (log: Partial<ActivityLog>) => {
  if (!db.app) return;
  await addDoc(collection(db, 'activityLogs'), {
    ...log,
    timestamp: Timestamp.now()
  });
};
