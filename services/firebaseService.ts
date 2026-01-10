import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, onSnapshot, Timestamp 
} from 'firebase/firestore';
import { 
  signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser 
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

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- CLIENTS ---

export const getClients = async (companyId: string): Promise<Client[]> => {
  const q = query(collection(db, 'clients'), where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const createClient = async (clientData: Partial<Client>) => {
  return await addDoc(collection(db, 'clients'), {
    ...clientData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

export const updateClient = async (clientId: string, data: Partial<Client>) => {
  const ref = doc(db, 'clients', clientId);
  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

// --- DISPUTES ---

export const createDispute = async (disputeData: any) => {
  return await addDoc(collection(db, 'disputes'), {
    ...disputeData,
    status: 'DRAFT',
    createdAt: Timestamp.now()
  });
};

export const getClientDisputes = async (clientId: string) => {
  const q = query(collection(db, 'disputes'), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- SUPPORT TICKETS ---

export const createTicket = async (ticket: Partial<SupportTicket>) => {
  return await addDoc(collection(db, 'tickets'), {
    ...ticket,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: 'OPEN'
  });
};

export const subscribeToTickets = (callback: (tickets: SupportTicket[]) => void) => {
  const q = query(collection(db, 'tickets'), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
    callback(tickets);
  });
};

// --- STORAGE ---

export const uploadDocument = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// --- LOGGING ---

export const logActivity = async (log: Partial<ActivityLog>) => {
  await addDoc(collection(db, 'activityLogs'), {
    ...log,
    timestamp: Timestamp.now()
  });
};
