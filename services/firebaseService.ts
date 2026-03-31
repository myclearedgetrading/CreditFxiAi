
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
import {
  Client,
  SupportTicket,
  ActivityLog,
  User,
  Dispute,
  DisputeRound,
  RepairTask,
  Deadline,
  ResponseIngestion,
  DisputeTemplate,
  TemplateExperiment,
  TemplateExposure,
} from '../types';

export const isPlatformAdmin = (user: Pick<User, 'role'> | null | undefined): boolean =>
  !!user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

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

const nowIso = () => new Date().toISOString();

const computePriorityScore = (
  estimatedScoreImpact: number,
  confidenceScoreImpact: number,
  urgencyScore: number,
  effortScore: number
) => {
  return Math.max(
    0,
    Number(
      (
        estimatedScoreImpact * confidenceScoreImpact * 0.5
        + urgencyScore * 0.35
        - effortScore * 0.15
      ).toFixed(2)
    )
  );
};

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
    createdAt: new Date().toISOString(),
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
    createdAt: merged.createdAt ?? new Date().toISOString(),
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

export const createDisputeRecord = async (companyId: string, dispute: Partial<Dispute>) => {
  if (!db.app) return { id: 'mock-dispute' } as any;
  const payload: Omit<Dispute, 'id'> = {
    companyId,
    clientId: dispute.clientId || '',
    negativeItemId: dispute.negativeItemId,
    strategy: dispute.strategy!,
    targetBureaus: dispute.targetBureaus || [],
    furnisher: dispute.furnisher,
    currentRoundNumber: dispute.currentRoundNumber || 1,
    overallStatus: dispute.overallStatus || 'DRAFT',
    outcome: dispute.outcome || 'PENDING',
    estimatedScoreImpact: dispute.estimatedScoreImpact || 0,
    nextAction: dispute.nextAction || 'Generate and send round 1 dispute package.',
    nextActionDueAt: dispute.nextActionDueAt,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return await addDoc(collection(db, 'disputes'), payload);
};

export const getDisputeById = async (disputeId: string): Promise<Dispute | null> => {
  if (!db.app) return null;
  const snap = await getDoc(doc(db, 'disputes', disputeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Dispute, 'id'>) };
};

export const updateDisputeRecord = async (disputeId: string, data: Partial<Dispute>) => {
  if (!db.app) throw new Error("Database not configured");
  const ref = doc(db, 'disputes', disputeId);
  await updateDoc(ref, { ...data, updatedAt: nowIso() });
};

export const createDisputeRound = async (companyId: string, round: Partial<DisputeRound>) => {
  if (!db.app) return { id: 'mock-round' } as any;
  const payload: Omit<DisputeRound, 'id'> = {
    companyId,
    clientId: round.clientId || '',
    disputeId: round.disputeId || '',
    roundNumber: round.roundNumber || 1,
    strategy: round.strategy!,
    targetBureaus: round.targetBureaus || [],
    templateVariantId: round.templateVariantId,
    status: round.status || 'DRAFT',
    sentAt: round.sentAt,
    responseDueAt: round.responseDueAt,
    responseReceivedAt: round.responseReceivedAt,
    outcome: round.outcome || 'PENDING',
    generatedLetter: round.generatedLetter,
    summary: round.summary,
    createdByUserId: round.createdByUserId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return await addDoc(collection(db, 'disputeRounds'), payload);
};

export const getDisputeRounds = async (companyId: string, disputeId: string): Promise<DisputeRound[]> => {
  if (!db.app) return [];
  const q = query(
    collection(db, 'disputeRounds'),
    where('companyId', '==', companyId),
    where('disputeId', '==', disputeId),
    orderBy('roundNumber', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DisputeRound, 'id'>) }));
};

export const updateDisputeRound = async (roundId: string, data: Partial<DisputeRound>) => {
  if (!db.app) throw new Error("Database not configured");
  await updateDoc(doc(db, 'disputeRounds', roundId), { ...data, updatedAt: nowIso() });
};

export const createRepairTask = async (companyId: string, task: Partial<RepairTask>) => {
  if (!db.app) return { id: 'mock-task' } as any;
  const estimatedScoreImpact = task.estimatedScoreImpact ?? 0;
  const confidenceScoreImpact = task.confidenceScoreImpact ?? 0.5;
  const urgencyScore = task.urgencyScore ?? 50;
  const effortScore = task.effortScore ?? 30;
  const payload: Omit<RepairTask, 'id'> = {
    companyId,
    clientId: task.clientId || '',
    disputeId: task.disputeId,
    disputeRoundId: task.disputeRoundId,
    title: task.title || 'Credit repair action',
    description: task.description || '',
    taskType: task.taskType || 'DISPUTE_FOLLOW_UP',
    status: task.status || 'OPEN',
    dueAt: task.dueAt,
    priorityLabel: task.priorityLabel || 'MEDIUM',
    estimatedScoreImpact,
    confidenceScoreImpact,
    urgencyScore,
    effortScore,
    priorityScore: computePriorityScore(estimatedScoreImpact, confidenceScoreImpact, urgencyScore, effortScore),
    linkedEntityType: task.linkedEntityType,
    linkedEntityId: task.linkedEntityId,
    assigneeUserId: task.assigneeUserId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    completedAt: task.completedAt,
  };
  return await addDoc(collection(db, 'tasks'), payload);
};

export const subscribeToRepairTasks = (
  companyId: string,
  callback: (tasks: RepairTask[]) => void
) => {
  if (!db.app) return () => {};
  const q = query(
    collection(db, 'tasks'),
    where('companyId', '==', companyId),
    where('status', 'in', ['OPEN', 'IN_PROGRESS', 'BLOCKED']),
    orderBy('priorityScore', 'desc'),
    limit(25)
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RepairTask, 'id'>) }));
    callback(tasks);
  });
};

export const updateRepairTask = async (taskId: string, data: Partial<RepairTask>) => {
  if (!db.app) throw new Error("Database not configured");
  await updateDoc(doc(db, 'tasks', taskId), {
    ...data,
    updatedAt: nowIso(),
    ...(data.status === 'DONE' ? { completedAt: nowIso() } : {})
  });
};

export const createDeadline = async (companyId: string, deadline: Partial<Deadline>) => {
  if (!db.app) return { id: 'mock-deadline' } as any;
  const payload: Omit<Deadline, 'id'> = {
    companyId,
    clientId: deadline.clientId || '',
    entityType: deadline.entityType || 'TASK',
    entityId: deadline.entityId || '',
    deadlineType: deadline.deadlineType || 'TASK_DUE',
    dueAt: deadline.dueAt || nowIso(),
    status: deadline.status || 'OPEN',
    severity: deadline.severity || 'MEDIUM',
    ownerUserId: deadline.ownerUserId,
    completedAt: deadline.completedAt,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return await addDoc(collection(db, 'deadlines'), payload);
};

export const getUpcomingDeadlines = async (companyId: string): Promise<Deadline[]> => {
  if (!db.app) return [];
  const q = query(
    collection(db, 'deadlines'),
    where('companyId', '==', companyId),
    where('status', 'in', ['OPEN', 'AT_RISK']),
    orderBy('dueAt', 'asc'),
    limit(30)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Deadline, 'id'>) }));
};

export const updateDeadline = async (deadlineId: string, data: Partial<Deadline>) => {
  if (!db.app) throw new Error("Database not configured");
  await updateDoc(doc(db, 'deadlines', deadlineId), { ...data, updatedAt: nowIso() });
};

export const createResponseIngestion = async (companyId: string, ingestion: Partial<ResponseIngestion>) => {
  if (!db.app) return { id: 'mock-ingestion' } as any;
  const payload: Omit<ResponseIngestion, 'id'> = {
    companyId,
    clientId: ingestion.clientId || '',
    disputeId: ingestion.disputeId || '',
    disputeRoundId: ingestion.disputeRoundId || '',
    source: ingestion.source || 'UPLOAD',
    fileName: ingestion.fileName || 'response-document',
    mimeType: ingestion.mimeType || 'application/octet-stream',
    documentStoragePath: ingestion.documentStoragePath,
    documentUrl: ingestion.documentUrl,
    ocrStatus: ingestion.ocrStatus || 'PENDING',
    parseStatus: ingestion.parseStatus || 'PENDING',
    parseConfidence: ingestion.parseConfidence || 0,
    summary: ingestion.summary,
    outcomes: ingestion.outcomes || [],
    errors: ingestion.errors || [],
    processedAt: ingestion.processedAt,
    createdAt: nowIso(),
  };
  return await addDoc(collection(db, 'responseIngestions'), payload);
};

export const getResponseIngestions = async (companyId: string, disputeId: string): Promise<ResponseIngestion[]> => {
  if (!db.app) return [];
  const q = query(
    collection(db, 'responseIngestions'),
    where('companyId', '==', companyId),
    where('disputeId', '==', disputeId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ResponseIngestion, 'id'>) }));
};

export const createDisputeTemplate = async (companyId: string, template: Partial<DisputeTemplate>) => {
  if (!db.app) return { id: 'mock-template' } as any;
  const payload: Omit<DisputeTemplate, 'id'> = {
    companyId,
    name: template.name || 'Template',
    strategy: template.strategy!,
    roundType: template.roundType || 'INITIAL',
    bureau: template.bureau || 'ANY',
    furnisher: template.furnisher,
    content: template.content || '',
    version: template.version || 1,
    isActive: template.isActive ?? true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return await addDoc(collection(db, 'disputeTemplates'), payload);
};

export const getDisputeTemplates = async (companyId: string): Promise<DisputeTemplate[]> => {
  if (!db.app) return [];
  const q = query(
    collection(db, 'disputeTemplates'),
    where('companyId', '==', companyId),
    where('isActive', '==', true),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DisputeTemplate, 'id'>) }));
};

export const createTemplateExperiment = async (companyId: string, experiment: Partial<TemplateExperiment>) => {
  if (!db.app) return { id: 'mock-experiment' } as any;
  const payload: Omit<TemplateExperiment, 'id'> = {
    companyId,
    name: experiment.name || 'Template experiment',
    goalMetric: experiment.goalMetric || 'DELETE_RATE',
    status: experiment.status || 'DRAFT',
    startAt: experiment.startAt,
    endAt: experiment.endAt,
    variants: experiment.variants || [],
    createdAt: nowIso(),
  };
  return await addDoc(collection(db, 'templateExperiments'), payload);
};

export const getTemplateExperiments = async (companyId: string): Promise<TemplateExperiment[]> => {
  if (!db.app) return [];
  const q = query(
    collection(db, 'templateExperiments'),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TemplateExperiment, 'id'>) }));
};

export const createTemplateExposure = async (companyId: string, exposure: Partial<TemplateExposure>) => {
  if (!db.app) return { id: 'mock-exposure' } as any;
  const payload: Omit<TemplateExposure, 'id'> = {
    companyId,
    experimentId: exposure.experimentId || '',
    variantId: exposure.variantId || 'A',
    templateId: exposure.templateId || '',
    disputeId: exposure.disputeId || '',
    disputeRoundId: exposure.disputeRoundId || '',
    clientId: exposure.clientId || '',
    assignedAt: exposure.assignedAt || nowIso(),
    resultAt: exposure.resultAt,
    resultOutcome: exposure.resultOutcome,
  };
  return await addDoc(collection(db, 'templateExposures'), payload);
};

export const getTemplateOutcomeSummary = async (companyId: string) => {
  if (!db.app) return [] as { variantId: string; total: number; deletedRate: number }[];
  const q = query(collection(db, 'templateExposures'), where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  const totals = new Map<string, { total: number; deleted: number }>();
  snapshot.docs.forEach((d) => {
    const row = d.data() as Omit<TemplateExposure, 'id'>;
    const key = row.variantId || 'unknown';
    const current = totals.get(key) || { total: 0, deleted: 0 };
    current.total += 1;
    if (row.resultOutcome === 'DELETED') current.deleted += 1;
    totals.set(key, current);
  });
  return Array.from(totals.entries()).map(([variantId, v]) => ({
    variantId,
    total: v.total,
    deletedRate: v.total ? Number(((v.deleted / v.total) * 100).toFixed(2)) : 0,
  }));
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

// --- PLATFORM ADMIN (requires Firestore rules: platform admins may list `users`) ---

export const adminFetchAllUsers = async (): Promise<User[]> => {
  if (!db.app) return [];
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((d) => {
    const data = d.data() as User;
    return normalizeTenantUser({ ...data, id: data.id || d.id });
  });
};

/** Best-effort ticket count for admin KPIs (fails silently if rules deny). */
export const adminTryCountOpenTickets = async (): Promise<number | null> => {
  if (!db.app) return null;
  try {
    const q = query(collection(db, 'tickets'), where('status', '==', 'OPEN'));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch {
    return null;
  }
};

/** Best-effort total clients across tenants (fails silently if rules deny). */
export const adminTryCountClients = async (): Promise<number | null> => {
  if (!db.app) return null;
  try {
    const snapshot = await getDocs(collection(db, 'clients'));
    return snapshot.size;
  } catch {
    return null;
  }
};
