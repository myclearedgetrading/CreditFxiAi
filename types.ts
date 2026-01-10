export enum ClientStatus {
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

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
  LATE_PAYMENT = 'Late Payment Removal'
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
}

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'SPECIALIST';
  email: string;
}

export interface DashboardStats {
  activeClients: number;
  disputesSent: number;
  itemsDeleted: number;
  revenue: number;
}

export interface Task {
  id: string;
  title: string;
  clientName: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'SYSTEM' | 'USER' | 'AI';
}

// Analysis Engine Types

export interface Discrepancy {
  type: 'BALANCE_MISMATCH' | 'DATE_MISMATCH' | 'STATUS_CONFLICT' | 'DUPLICATE_ACCOUNT';
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  itemsInvolved: string[]; // Creditor names
}

export interface StrategyRecommendation {
  itemId: string;
  creditorName: string;
  recommendedStrategy: DisputeStrategy;
  confidenceScore: number; // 0-100
  reasoning: string;
  bureauToTarget: Bureau;
}

export interface ActionPlanStep {
  phase: 'Day 1-30' | 'Day 31-60' | 'Day 61-90';
  actions: string[];
  expectedOutcome: string;
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
  actionPlan: ActionPlanStep[];
}

// Predictive Analytics Types

export interface DisputePrediction {
  probability: number; // 0-100
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

export interface ChurnRiskProfile {
  clientId: string;
  clientName: string;
  riskScore: number; // 0-100 (100 = leaving)
  primaryRiskFactor: string;
  suggestedRetentionAction: string;
}

// Automation Engine Types

export type AutomationTriggerType = 'SCORE_CHANGE' | 'DISPUTE_STATUS_UPDATE' | 'NO_LOGIN_DETECTED' | 'NEW_DOCUMENT_UPLOAD' | 'PAYMENT_FAILED';
export type AutomationActionType = 'SEND_EMAIL' | 'CREATE_TASK' | 'SEND_SMS' | 'UPDATE_STATUS' | 'NOTIFY_SLACK';

export interface AutomationCondition {
  field: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'CONTAINS';
  value: string | number;
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, any>; // e.g., { templateId: 'welcome_email' }
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  stats: {
    runsLast30Days: number;
    hoursSaved: number;
  };
}

export interface EmailAnalysisResult {
  category: 'INQUIRY' | 'COMPLAINT' | 'UPDATE' | 'OTHER';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  suggestedResponse: string;
  actionItems: string[];
}

export interface DocumentClassification {
  category: 'ID_CARD' | 'PROOF_OF_ADDRESS' | 'CREDIT_REPORT' | 'BUREAU_RESPONSE' | 'OTHER';
  confidence: number;
  extractedData: Record<string, any>;
}

export interface BureauResponseResult {
  bureau: Bureau;
  date: string;
  outcomes: {
    creditor: string;
    accountNumber: string;
    outcome: 'DELETED' | 'VERIFIED' | 'UPDATED' | 'REMAINS';
  }[];
}

// Reporting & BI Types

export interface KPIMetric {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendDirection: 'UP' | 'DOWN';
  period: string;
}

export interface DisputeSuccessMetric {
  bureau: Bureau;
  successRate: number;
  totalDisputes: number;
  avgResponseTimeDays: number;
}

export interface SpecialistPerformance {
  specialistName: string;
  activeClients: number;
  revenueGenerated: number;
  disputeSuccessRate: number;
  clientSatisfactionScore: number; // 1-10
}

export interface CustomReportConfig {
  id: string;
  name: string;
  metrics: string[];
  dateRange: 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'YTD' | 'ALL_TIME';
  visualization: 'BAR' | 'LINE' | 'PIE' | 'TABLE';
}

// Communication Hub Types

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'specialist';
  text: string;
  timestamp: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Completed';
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
  type: 'Onboarding' | 'Strategy Call' | 'Monthly Review';
  startTime: string; // ISO string
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface EducationArticle {
  id: string;
  title: string;
  category: 'Credit Basics' | 'Disputes' | 'Budgeting';
  content: string; // short summary or full text
  isAiGenerated: boolean;
}

// Gamification Types

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; 
  unlocked: boolean;
  progress: number; // 0-100
  pointsReward: number;
  unlockedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'BASICS' | 'BUILDING' | 'ADVANCED';
  totalSteps: number;
  completedSteps: number;
  rewardPoints: number;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
}

export interface GamificationProfile {
  level: number;
  currentPoints: number;
  pointsToNextLevel: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  streakDays: number;
  referralCode: string;
  totalReferrals: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Security & Compliance Types

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SPECIALIST' | 'AUDITOR';

export interface Permission {
  id: string;
  label: string;
  description: string;
  category: 'CLIENTS' | 'FINANCE' | 'SETTINGS' | 'SECURITY';
}

export interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface RBACRole {
  role: Role;
  permissions: string[]; // Permission IDs
  usersCount: number;
}

export interface ComplianceRequest {
  id: string;
  clientId: string;
  clientName: string;
  type: 'EXPORT_DATA' | 'DELETE_DATA' | 'CORRECT_DATA';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  requestDate: string;
  completionDate?: string;
}

export interface SecurityScanResult {
  score: number; // 0-100
  lastScan: string;
  vulnerabilities: {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    issue: string;
    description: string;
    remediation: string;
  }[];
}

// Integration Ecosystem Types

export type IntegrationCategory = 'CREDIT_BUREAU' | 'PAYMENT' | 'COMMUNICATION' | 'MARKETING' | 'DOCUMENT' | 'ACCOUNTING';

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';
  lastSync?: string;
  icon: string; // Lucide icon name mapping
  config?: Record<string, any>;
  health: number; // 0-100
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

// AI Learning Center Types

export type KnowledgeCategory = 'FCRA' | 'FDCPA' | 'PLAYBOOK' | 'SCRIPTS' | 'CASE_STUDY';

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  confidenceScore: number;
}

export interface ModelFeedback {
  id: string;
  originalInput: string;
  aiOutput: string;
  userCorrection: string;
  rating: 'GOOD' | 'BAD' | 'NEUTRAL';
  timestamp: string;
  status: 'PENDING' | 'LEARNED';
}

export interface StrategyPerformance {
  strategyName: string;
  bureau: Bureau;
  successRate: number; // percentage
  usageCount: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

// Customer Success & Support Types

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'BILLING' | 'DISPUTE_UPDATE' | 'TECHNICAL' | 'GENERAL' | 'LEGAL';

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  assignedTo?: string; // Specialist Name
  createdAt: string;
  updatedAt: string;
  channel: 'EMAIL' | 'CHAT' | 'PHONE' | 'PORTAL';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  tags: string[];
}

export interface TicketAnalysis {
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  suggestedReply: string;
  tags: string[];
}

export interface ClientHealthMetric {
  clientId: string;
  clientName: string;
  overallScore: number; // 0-100
  engagementScore: number;
  paymentHealth: number;
  disputeSuccess: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastContact: string;
  nextScheduledTouchpoint: string;
  riskFactors: string[];
}

export interface Feedback {
  id: string;
  clientId: string;
  type: 'NPS' | 'CSAT';
  score: number;
  comment?: string;
  date: string;
}
