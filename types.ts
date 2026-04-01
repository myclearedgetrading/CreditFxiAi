
export enum Bureau {
  EQUIFAX = 'Equifax',
  EXPERIAN = 'Experian',
  TRANSUNION = 'TransUnion'
}

export enum DisputeStrategy {
  FACTUAL = 'Factual Dispute',
  VALIDATION = 'Debt Validation',
  GOODWILL = 'Goodwill Adjustment',
  IDENTITY_THEFT = 'Identity Theft',
  LATE_PAYMENT = 'Late Payment Removal',
  METRO2 = 'Metro 2 Compliance Challenge'
}

export interface NegativeItem {
  id: string;
  type: string;
  creditor: string;
  accountNumber: string;
  amount: number;
  dateReported: string;
  bureau: Bureau[];
  status: 'Open' | 'Disputed' | 'Deleted' | 'Verified';
}

/** Aligns with `firestore.rules` role checks (DIY users typically `USER`). */
export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'CLIENT'
  | 'SUPER_ADMIN'
  | 'SPECIALIST'
  | 'AUDITOR';

// User now represents the DIY User / Business Owner
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Firestore tenant id: solo DIY often uses `id` (see `firebaseService.registerWithEmail`). */
  companyId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  creditScore: {
    equifax: number;
    experian: number;
    transunion: number;
  };
  negativeItems: NegativeItem[];
  businessProfile?: BusinessProfile;
  role: UserRole;
  /** ISO timestamp — set on first registration for admin growth KPIs */
  createdAt?: string;
  verificationDocuments?: {
    idCard: boolean;
    ssnCard: boolean;
    proofOfAddress: boolean;
  };
  lastReportAnalysisAt?: string;
  lastReportFileName?: string;
  lastReportSource?: 'PDF' | 'IMAGE' | 'PROVIDER';
  lastEstimatedScoreImprovement?: number;
  lastNegativeItemCount?: number;
}

export enum ClientStatus {
  ACTIVE = 'Active',
  LEAD = 'Lead',
  PROSPECT = 'Prospect',
  CHURNED = 'Churned'
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  creditScore: {
    equifax: number;
    experian: number;
    transunion: number;
  };
  negativeItems: NegativeItem[];
  joinedDate: string;
  companyId?: string;
}

// --- MARKETPLACE TYPES ---
export type ProductType = 'SECURED_CARD' | 'UNSECURED_CARD' | 'LOAN' | 'RENT_REPORTING';

export interface CreditProduct {
  id: string;
  name: string;
  issuer: string;
  type: ProductType;
  description: string;
  annualFee: number;
  apr?: string;
  minDeposit?: number;
  creditImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  approvalOdds: 'EXCELLENT' | 'GOOD' | 'FAIR';
  features: string[];
  imageUrl: string;
  applyLink: string;
  aiReasoning?: string; // Populated dynamically
  matchScore?: number; // 0-100
}

// --- BUSINESS FUNDING TYPES ---

export enum FundingTier {
  TIER_1 = 'Tier 1 (Net 30)',
  TIER_2 = 'Tier 2 (Store Credit)',
  TIER_3 = 'Tier 3 (Cash Credit)',
  TIER_4 = 'Tier 4 (Business Loans)'
}

export interface BusinessProfile {
  businessName: string;
  ein: string;
  dunsNumber: string;
  entityType: 'LLC' | 'Corp' | 'Sole Prop';
  addressVerified: boolean;
  phoneVerified: boolean;
  websiteVerified: boolean;
  fundingReadinessScore: number; // 0-100
  currentTier: FundingTier;
}

export interface FundingOpportunity {
  id: string;
  lenderName: string;
  type: 'Vendor Credit' | 'Business Card' | 'Term Loan' | 'Line of Credit';
  amount: string;
  requirements: string[];
  matchScore: number; // AI calculated
  logo: string;
  link: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
  category: 'FOUNDATION' | 'CREDIT_BUILDING' | 'FINANCIALS';
}

// --- SHARED TYPES ---

export interface DashboardStats {
  creditScoreAvg: number;
  negativeItemsRemoved: number;
  fundingAvailable: number;
  tasksPending: number;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
  category: 'PERSONAL' | 'BUSINESS';
}

export type DisputeStatus =
  | 'DRAFT'
  | 'SENT'
  | 'RESPONDED'
  | 'ESCALATED'
  | 'CLOSED';

export type DisputeRoundStatus =
  | 'DRAFT'
  | 'READY_TO_SEND'
  | 'SENT'
  | 'RESPONSE_RECEIVED'
  | 'ESCALATED'
  | 'CLOSED';

export type DisputeOutcome =
  | 'PENDING'
  | 'DELETED'
  | 'VERIFIED'
  | 'UPDATED'
  | 'PARTIAL'
  | 'NO_CHANGE';

export interface Dispute {
  id: string;
  companyId?: string;
  clientId: string;
  negativeItemId?: string;
  strategy: DisputeStrategy;
  targetBureaus: Bureau[];
  furnisher?: string;
  currentRoundNumber: number;
  overallStatus: DisputeStatus;
  outcome: DisputeOutcome;
  estimatedScoreImpact?: number;
  nextAction?: string;
  nextActionDueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeRound {
  id: string;
  companyId?: string;
  clientId: string;
  disputeId: string;
  roundNumber: number;
  strategy: DisputeStrategy;
  targetBureaus: Bureau[];
  templateVariantId?: string;
  status: DisputeRoundStatus;
  sentAt?: string;
  responseDueAt?: string;
  responseReceivedAt?: string;
  outcome: DisputeOutcome;
  generatedLetter?: string;
  summary?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RepairTaskType =
  | 'DISPUTE_SEND'
  | 'DISPUTE_FOLLOW_UP'
  | 'DOC_REQUEST'
  | 'DOC_UPLOAD'
  | 'CREDIT_OPTIMIZATION'
  | 'RESPONSE_REVIEW';

export type RepairTaskStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export interface RepairTask {
  id: string;
  companyId?: string;
  clientId: string;
  disputeId?: string;
  disputeRoundId?: string;
  title: string;
  description: string;
  taskType: RepairTaskType;
  status: RepairTaskStatus;
  dueAt?: string;
  priorityLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedScoreImpact: number;
  confidenceScoreImpact: number;
  urgencyScore: number;
  effortScore: number;
  priorityScore: number;
  linkedEntityType?: string;
  linkedEntityId?: string;
  assigneeUserId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type DeadlineType =
  | 'BUREAU_RESPONSE'
  | 'FOLLOW_UP'
  | 'DOC_SUBMISSION'
  | 'TASK_DUE';

export interface Deadline {
  id: string;
  companyId?: string;
  clientId: string;
  entityType: 'DISPUTE' | 'DISPUTE_ROUND' | 'TASK' | 'INGESTION';
  entityId: string;
  deadlineType: DeadlineType;
  dueAt: string;
  status: 'OPEN' | 'AT_RISK' | 'MISSED' | 'COMPLETED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerUserId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseIngestion {
  id: string;
  companyId?: string;
  clientId: string;
  disputeId: string;
  disputeRoundId: string;
  source: 'UPLOAD' | 'EMAIL' | 'MAIL_SCAN' | 'API';
  fileName: string;
  mimeType: string;
  documentStoragePath?: string;
  documentUrl?: string;
  ocrStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  parseStatus: 'PENDING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
  parseConfidence: number;
  summary?: string;
  outcomes: { bureau: string; creditor: string; accountNumber: string; outcome: DisputeOutcome }[];
  errors: string[];
  processedAt?: string;
  createdAt: string;
}

export interface DisputeTemplate {
  id: string;
  companyId?: string;
  name: string;
  strategy: DisputeStrategy;
  roundType: 'INITIAL' | 'FOLLOW_UP' | 'ESCALATION';
  bureau?: Bureau | 'ANY';
  furnisher?: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExperiment {
  id: string;
  companyId?: string;
  name: string;
  goalMetric: 'DELETE_RATE' | 'RESPONSE_RATE' | 'TIME_TO_RESOLUTION';
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startAt?: string;
  endAt?: string;
  variants: { variantId: string; templateId: string; trafficPct: number }[];
  createdAt: string;
}

export interface TemplateExposure {
  id: string;
  companyId?: string;
  experimentId: string;
  variantId: string;
  templateId: string;
  disputeId: string;
  disputeRoundId: string;
  clientId: string;
  assignedAt: string;
  resultAt?: string;
  resultOutcome?: DisputeOutcome;
}

export interface ActivityLog {
  id: string;
  /** Tenant id — required for Path A Firestore rules */
  companyId?: string;
  action: string;
  description: string;
  timestamp: any;
  type: 'SYSTEM' | 'USER' | 'AI';
}

export interface Discrepancy {
  type: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  itemsInvolved: string[];
}

export interface StrategyRecommendation {
  itemId: string;
  creditorName: string;
  recommendedStrategy: string;
  confidenceScore: number;
  reasoning: string;
  bureauToTarget: string;
}

export interface CreditAnalysisResult {
  summary: {
    totalNegativeItems: number;
    estimatedScoreImprovement: number;
    utilizationRate: number;
  };
  negativeItems: {
    creditor: string;
    accountType: string;
    amount: number;
    bureau: string;
    date: string;
  }[];
  discrepancies: Discrepancy[];
  recommendations: StrategyRecommendation[];
  actionPlan: { phase: string; actions: string[]; expectedOutcome: string }[];
}

export interface DisputePrediction {
  probability: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  keyFactors: string[];
  estimatedDaysToResult: number;
}

export interface ScoreForecastPoint {
  month: string;
  bestCase: number;
  likelyCase: number;
  worstCase: number;
}

export interface EmailAnalysisResult {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  sentiment: string;
  suggestedResponse: string;
  actionItems: string[];
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: { field: string; operator: string; value: any }[];
  actions: { type: string; config: any }[];
  isActive: boolean;
  stats: { runsLast30Days: number; hoursSaved: number };
}

export interface DocumentClassification {
  category: string;
  confidence: number;
}

export interface BureauResponseResult {
  bureau: string;
  date: string;
  outcomes: { creditor: string; accountNumber: string; outcome: 'DELETED' | 'VERIFIED' | 'UPDATED' }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  tags: string[];
  lastUpdated: string;
  confidenceScore: number;
}

export interface TicketAnalysis {
  priority: TicketPriority;
  category: string;
  sentiment: string;
  tags: string[];
}

export interface ChurnRiskProfile {
  clientId: string;
  clientName: string;
  riskScore: number;
  primaryRiskFactor: string;
  suggestedRetentionAction: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  status: string;
  audience: string;
  openRate: number;
  clickRate: number;
  nextScheduled: string | null;
}

export interface SMSConversation {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  startTime: string;
  status: string;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  isAiGenerated: boolean;
}

export interface GamificationProfile {
  level: number;
  currentPoints: number;
  pointsToNextLevel: number;
  tier: string;
  streakDays: number;
  referralCode: string;
  totalReferrals: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  pointsReward: number;
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  totalSteps: number;
  completedSteps: number;
  rewardPoints: number;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
}

export interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: any;
}

export interface RBACRole {
  role: string;
  permissions: string[];
  usersCount: number;
}

export interface ComplianceRequest {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  status: 'PENDING' | 'COMPLETED';
  requestDate: string;
}

export interface SecurityScanResult {
  severity: string;
  issue: string;
  description: string;
  remediation: string;
}

export type IntegrationCategory = 'CREDIT_BUREAU' | 'PAYMENT' | 'COMMUNICATION' | 'MARKETING' | 'DOCUMENT' | 'ACCOUNTING';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  icon: string;
  lastSync?: string;
  health: number;
  requiresOAuth: boolean;
}

export interface WebhookEvent {
  id: string;
  source: string;
  event: string;
  timestamp: string;
  status: 'PROCESSED' | 'FAILED';
  payload: any;
}

export interface ModelFeedback {
  id: string;
  originalInput?: string;
  aiOutput?: string;
  userCorrection?: string;
  rating?: string;
  timestamp?: string;
  status: 'PENDING' | 'LEARNED';
}

export interface StrategyPerformance {
  strategyName: string;
  bureau: string;
  successRate: number;
  usageCount: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';

export interface SupportTicket {
  id: string;
  /** Tenant id — required for Path A Firestore rules */
  companyId?: string;
  clientId: string;
  clientName: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  createdAt: string;
  updatedAt: string;
  channel: string;
  sentiment: string;
  tags: string[];
}

export interface ClientHealthMetric {
  clientId: string;
  clientName: string;
  overallScore: number;
  engagementScore: number;
  paymentHealth: number;
  disputeSuccess: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastContact: string;
  nextScheduledTouchpoint: string;
  riskFactors: string[];
}
