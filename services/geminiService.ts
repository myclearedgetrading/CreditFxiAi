import {
  User,
  NegativeItem,
  DisputeStrategy,
  Bureau,
  CreditAnalysisResult,
  DisputePrediction,
  ScoreForecastPoint,
  EmailAnalysisResult,
  AutomationWorkflow,
  DocumentClassification,
  BureauResponseResult,
  QuizQuestion,
  KnowledgeArticle,
  TicketAnalysis,
} from '../types';

/** Calls Vercel `/api/gemini` — key stays server-side. Use `vercel dev` locally for AI routes. */
async function callGeminiApi<T>(action: string, payload: unknown): Promise<T> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const data = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok) {
    throw new Error(data.error || `AI request failed (${res.status})`);
  }
  return data.result as T;
}

interface GenerateLetterParams {
  client: User;
  item: NegativeItem;
  strategy: DisputeStrategy;
  targetBureau: Bureau;
}

export const generateDisputeLetter = async (params: GenerateLetterParams): Promise<string> => {
  return callGeminiApi<string>('generateDisputeLetter', params);
};

export const analyzeCreditReportHTML = async (htmlContent: string): Promise<CreditAnalysisResult> => {
  return callGeminiApi<CreditAnalysisResult>('analyzeCreditReportHTML', htmlContent);
};

export const analyzeCreditReportImage = async (
  base64Image: string,
  mimeType: string
): Promise<CreditAnalysisResult> => {
  return callGeminiApi<CreditAnalysisResult>('analyzeCreditReportImage', { base64Image, mimeType });
};

export const generateFundingPlan = async (businessData: unknown): Promise<unknown> => {
  return callGeminiApi('generateFundingPlan', businessData);
};

export const predictDisputeOutcome = async (
  itemType: string,
  itemAge: string,
  bureau: string,
  strategy: string
): Promise<DisputePrediction> => {
  return callGeminiApi<DisputePrediction>('predictDisputeOutcome', {
    itemType,
    itemAge,
    bureau,
    strategy,
  });
};

export const forecastCreditScore = async (
  currentScore: number,
  negativeItemsCount: number,
  utilization: number
): Promise<ScoreForecastPoint[]> => {
  return callGeminiApi<ScoreForecastPoint[]>('forecastCreditScore', {
    currentScore,
    negativeItemsCount,
    utilization,
  });
};

export const generateEducationalContent = async (topic: string): Promise<string> => {
  return callGeminiApi<string>('generateEducationalContent', topic);
};

export const generateTutorResponse = async (context: string, question: string): Promise<string> => {
  return callGeminiApi<string>('generateTutorResponse', { context, question });
};

export const searchKnowledgeBase = async (_query: string): Promise<KnowledgeArticle[]> => {
  return [];
};

export const submitModelFeedback = async (_feedback: unknown): Promise<boolean> => {
  return true;
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion> => {
  return callGeminiApi<QuizQuestion>('generateQuiz', topic);
};

export const analyzeInboundEmail = async (emailContent: string): Promise<EmailAnalysisResult> => {
  return callGeminiApi<EmailAnalysisResult>('analyzeInboundEmail', emailContent);
};

export const suggestAutomationWorkflow = async (goal: string): Promise<Partial<AutomationWorkflow>> => {
  return callGeminiApi<Partial<AutomationWorkflow>>('suggestAutomationWorkflow', goal);
};

export const classifyDocument = async (filename: string): Promise<DocumentClassification> => {
  return callGeminiApi<DocumentClassification>('classifyDocument', filename);
};

export const parseBureauResponse = async (content: string): Promise<BureauResponseResult> => {
  return callGeminiApi<BureauResponseResult>('parseBureauResponse', content);
};

export const generateExecutiveSummary = async (data: unknown): Promise<string> => {
  return callGeminiApi<string>('generateExecutiveSummary', data);
};

export const generateChatResponse = async (history: unknown[], userMessage: string): Promise<string> => {
  return callGeminiApi<string>('generateChatResponse', { history, userMessage });
};

export const analyzeSupportTicket = async (subject: string, message: string): Promise<TicketAnalysis> => {
  return callGeminiApi<TicketAnalysis>('analyzeSupportTicket', { subject, message });
};
