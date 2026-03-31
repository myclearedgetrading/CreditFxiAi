import { GoogleGenAI } from '@google/genai';
import type {
  User,
  NegativeItem,
  CreditAnalysisResult,
  DisputePrediction,
  ScoreForecastPoint,
  EmailAnalysisResult,
  AutomationWorkflow,
  DocumentClassification,
  BureauResponseResult,
  QuizQuestion,
  TicketAnalysis,
  Bureau,
} from '../../types';
import { DisputeStrategy } from '../../types';

function getClient(): GoogleGenAI {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Server misconfiguration: API_KEY or GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
}

export async function runGenerateDisputeLetter(payload: {
  client: User;
  item: NegativeItem;
  strategy: DisputeStrategy;
  targetBureau: Bureau;
}): Promise<string> {
  const ai = getClient();
  const { client, item, strategy, targetBureau } = payload;
  let additionalContext = '';
  if (strategy === DisputeStrategy.METRO2) {
    additionalContext = `
      CRITICAL: This is a Metro 2 Compliance Challenge. 
      1. Explicitly demand an audit of the Metro 2 format data fields, specifically the "Account Status", "Payment History Profile", and "Compliance Condition Code".
      2. State that the Consumer Data Industry Association (CDIA) Credit Reporting Resource Guide requires 100% accuracy in these fields.
      3. Assert that standard e-OSCAR automated verification is insufficient proof of Metro 2 compliance.
      4. Ask for the raw data transmission log associated with this account.
    `;
  }

  const prompt = `
    You are an expert Credit Repair Coach assisting a user in repairing their own credit.
    
    Task: Write a personal dispute letter from the user to ${targetBureau}.
    
    User Details:
    Name: ${client.firstName} ${client.lastName}
    Current Address: ${client.address?.street || '[Address]'}, ${client.address?.city || '[City]'}, ${client.address?.state || '[State]'} ${client.address?.zip || '[Zip]'}
    
    Negative Item to Dispute:
    Creditor: ${item.creditor}
    Account Number: ${item.accountNumber}
    Amount: $${item.amount}
    Date Reported: ${item.dateReported}
    Error/Issue: ${item.type}
    
    Strategy to use: ${strategy}
    ${additionalContext}
    
    Instructions:
    1. Write in the FIRST PERSON ("I am writing to dispute...").
    2. Be firm but professional.
    3. Cite relevant FCRA sections (Section 609, 611) as a consumer asserting their rights.
    4. Demand validation or removal.
    5. Do not use complex legal jargon that sounds like a lawyer wrote it; it must sound like an educated consumer.
    6. Return only the body of the letter.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });

  return response.text || 'Failed to generate letter content.';
}

export async function runAnalyzeCreditReportHTML(htmlContent: string): Promise<CreditAnalysisResult> {
  const ai = getClient();
  const prompt = `
    Analyze this raw HTML credit report. You are an expert credit analyst.
    
    Data to Extract:
    1. Identify all negative items (Collections, Late Payments, Charge-offs).
    2. Compare data across bureaus (Equifax, Experian, TransUnion) to find factual discrepancies.
    3. Calculate potential score improvement.
    4. Provide specific strategies for each negative item.

    Return JSON ONLY matching this schema:
    {
      "summary": { "totalNegativeItems": number, "estimatedScoreImprovement": number, "utilizationRate": number },
      "negativeItems": [{ "creditor": string, "accountType": string, "amount": number, "bureau": string, "date": string }],
      "discrepancies": [{ "type": string, "description": string, "severity": "HIGH"|"MEDIUM"|"LOW", "itemsInvolved": string[] }],
      "recommendations": [{ "itemId": string, "creditorName": string, "recommendedStrategy": string, "confidenceScore": number, "reasoning": string, "bureauToTarget": string }],
      "actionPlan": [{ "phase": string, "actions": string[], "expectedOutcome": string }]
    }
  `;

  const truncatedHTML = htmlContent.length > 300000 ? htmlContent.substring(0, 300000) : htmlContent;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt + '\n\nHTML CONTENT:\n' + truncatedHTML,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runAnalyzeCreditReportImage(
  base64Image: string,
  mimeType: string
): Promise<CreditAnalysisResult> {
  const ai = getClient();
  const prompt = `
    Analyze this credit report image. Extract negative items, find inconsistencies, and recommend strategies.
    
    Return JSON ONLY matching this schema:
    {
      "summary": { "totalNegativeItems": number, "estimatedScoreImprovement": number, "utilizationRate": number },
      "negativeItems": [{ "creditor": string, "accountType": string, "amount": number, "bureau": string, "date": string }],
      "discrepancies": [{ "type": string, "description": string, "severity": "HIGH"|"MEDIUM"|"LOW", "itemsInvolved": string[] }],
      "recommendations": [{ "itemId": string, "creditorName": string, "recommendedStrategy": string, "confidenceScore": number, "reasoning": string, "bureauToTarget": string }],
      "actionPlan": [{ "phase": string, "actions": string[], "expectedOutcome": string }]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt },
      ],
    },
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text || '{}';
  const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonString) as CreditAnalysisResult;
}

export async function runGenerateFundingPlan(businessData: unknown): Promise<unknown> {
  const ai = getClient();
  const prompt = `
    Analyze this business profile and generate a funding roadmap.
    Data: ${JSON.stringify(businessData)}
    
    Return JSON with:
    - currentTier (Tier 1, 2, 3, or 4)
    - recommendedSources (List of specific vendors/cards)
    - complianceIssues (List of missing requirements)
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '{}');
}

export async function runPredictDisputeOutcome(payload: {
  itemType: string;
  itemAge: string;
  bureau: string;
  strategy: string;
}): Promise<DisputePrediction> {
  const ai = getClient();
  const { itemType, itemAge, bureau, strategy } = payload;
  const prompt = `
    Predict the dispute outcome for:
    Item: ${itemType}
    Age: ${itemAge}
    Bureau: ${bureau}
    Strategy: ${strategy}
    
    Return JSON: { probability: number (0-100), confidenceLevel: string, keyFactors: string[], estimatedDaysToResult: number }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '{}');
}

export async function runForecastCreditScore(payload: {
  currentScore: number;
  negativeItemsCount: number;
  utilization: number;
}): Promise<ScoreForecastPoint[]> {
  const ai = getClient();
  const { currentScore, negativeItemsCount, utilization } = payload;
  const prompt = `
    Forecast credit score over next 6 months.
    Current: ${currentScore}, Negatives: ${negativeItemsCount}, Utilization: ${utilization}%
    
    Return JSON array of objects: { month: string, bestCase: number, likelyCase: number, worstCase: number }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text || '[]');
}

export async function runGenerateEducationalContent(topic: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Write a comprehensive educational guide about: ${topic}. Format in Markdown. Keep it under 500 words.`,
  });
  return response.text || '';
}

export async function runGenerateTutorResponse(context: string, question: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Context: ${context}\n\nUser Question: ${question}\n\nAnswer as a helpful credit repair tutor.`,
  });
  return response.text || '';
}

export async function runGenerateQuiz(topic: string): Promise<QuizQuestion> {
  const ai = getClient();
  const prompt = `Generate a multiple choice question about ${topic}. Return JSON: { question: string, options: string[], correctIndex: number, explanation: string }`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runAnalyzeInboundEmail(emailContent: string): Promise<EmailAnalysisResult> {
  const ai = getClient();
  const prompt = `
    Analyze this inbound email: "${emailContent}"
    Return JSON: { priority: "HIGH"|"MEDIUM"|"LOW", category: string, sentiment: string, suggestedResponse: string, actionItems: string[] }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runSuggestAutomationWorkflow(goal: string): Promise<Partial<AutomationWorkflow>> {
  const ai = getClient();
  const prompt = `
    Create an automation workflow for goal: "${goal}"
    Return JSON: { name: string, description: string, trigger: string, conditions: object[], actions: object[] }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runClassifyDocument(filename: string): Promise<DocumentClassification> {
  const ai = getClient();
  const prompt = `Classify this file based on name: "${filename}". Return JSON: { category: string, confidence: number }`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runParseBureauResponse(content: string): Promise<BureauResponseResult> {
  const ai = getClient();
  const prompt = `Parse this credit bureau response letter. Return JSON: { bureau: string, date: string, outcomes: [{ creditor: string, accountNumber: string, outcome: string }] }`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt + `\n\n${content}`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runAnalyzeBureauResponseLetter(payload: {
  responseText: string;
  bureau?: string;
  furnisher?: string;
}): Promise<{
  summary: string;
  confidence: number;
  outcomes: { bureau: string; creditor: string; accountNumber: string; outcome: string }[];
}> {
  const ai = getClient();
  const prompt = `
    Analyze this credit bureau or furnisher response letter and extract outcomes.
    Return JSON only with:
    {
      "summary": string,
      "confidence": number,
      "outcomes": [
        { "bureau": string, "creditor": string, "accountNumber": string, "outcome": "DELETED"|"VERIFIED"|"UPDATED"|"PARTIAL"|"NO_CHANGE" }
      ]
    }

    Optional context:
    Bureau: ${payload.bureau || 'Unknown'}
    Furnisher: ${payload.furnisher || 'Unknown'}
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `${prompt}\n\nLETTER:\n${payload.responseText}`,
    config: { responseMimeType: 'application/json' },
  });
  const text = (response.text || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}

export async function runDetermineDisputeNextActions(payload: {
  currentRoundNumber: number;
  status: string;
  parsedSummary: string;
  outcomes: { outcome: string; creditor?: string }[];
}): Promise<{
  nextStatus: string;
  shouldAdvanceRound: boolean;
  nextActions: { type: string; label: string; rationale: string; urgency: number }[];
}> {
  const ai = getClient();
  const prompt = `
    You are a dispute workflow strategist.
    Determine the best next actions from this response state.
    Return JSON only:
    {
      "nextStatus": "RESPONDED"|"ESCALATED"|"CLOSED"|"SENT",
      "shouldAdvanceRound": boolean,
      "nextActions": [{ "type": string, "label": string, "rationale": string, "urgency": number }]
    }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `${prompt}\n\nDATA:\n${JSON.stringify(payload)}`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runEstimateDisputeScoreImpact(payload: {
  currentScore: number;
  outcomes: { outcome: string }[];
  negativeItemsRemaining: number;
}): Promise<{ bestCase: number; likelyCase: number; worstCase: number; explanation: string }> {
  const ai = getClient();
  const prompt = `
    Estimate likely score impact based on dispute outcomes.
    Return JSON only:
    { "bestCase": number, "likelyCase": number, "worstCase": number, "explanation": string }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `${prompt}\n\nDATA:\n${JSON.stringify(payload)}`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runGenerateStrategyTemplateByTarget(payload: {
  strategy: string;
  bureau: string;
  furnisher?: string;
  roundNumber: number;
  clientName: string;
}): Promise<{ subject: string; body: string; checklist: string[] }> {
  const ai = getClient();
  const prompt = `
    Generate a concise dispute template tailored for this target.
    Return JSON only:
    { "subject": string, "body": string, "checklist": string[] }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `${prompt}\n\nDATA:\n${JSON.stringify(payload)}`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function runOrchestrateClosedLoopCreditRepair(payload: {
  responseText: string;
  bureau?: string;
  furnisher?: string;
  currentRoundNumber: number;
  status: string;
  currentScore: number;
  negativeItemsRemaining: number;
  strategy: string;
  clientName: string;
}): Promise<{
  parsedResponse: unknown;
  workflow: unknown;
  scoreImpact: unknown;
  template: unknown;
}> {
  const parsedResponse = await runAnalyzeBureauResponseLetter({
    responseText: payload.responseText,
    bureau: payload.bureau,
    furnisher: payload.furnisher,
  });
  const workflow = await runDetermineDisputeNextActions({
    currentRoundNumber: payload.currentRoundNumber,
    status: payload.status,
    parsedSummary: parsedResponse.summary,
    outcomes: parsedResponse.outcomes,
  });
  const scoreImpact = await runEstimateDisputeScoreImpact({
    currentScore: payload.currentScore,
    outcomes: parsedResponse.outcomes,
    negativeItemsRemaining: payload.negativeItemsRemaining,
  });
  const template = await runGenerateStrategyTemplateByTarget({
    strategy: payload.strategy,
    bureau: payload.bureau || 'Unknown',
    furnisher: payload.furnisher,
    roundNumber: payload.currentRoundNumber + (workflow.shouldAdvanceRound ? 1 : 0),
    clientName: payload.clientName,
  });

  return {
    parsedResponse,
    workflow,
    scoreImpact,
    template,
  };
}

export async function runGenerateExecutiveSummary(data: unknown): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Generate a 2-sentence executive summary for this user's credit progress: ${JSON.stringify(data)}`,
  });
  return response.text || '';
}

export async function runGenerateChatResponse(
  _history: unknown[],
  userMessage: string
): Promise<string> {
  const ai = getClient();
  const chat = ai.chats.create({ model: 'gemini-2.0-flash' });
  const result = await chat.sendMessage({ message: userMessage });
  return result.text || '';
}

export async function runAnalyzeSupportTicket(subject: string, message: string): Promise<TicketAnalysis> {
  const ai = getClient();
  const prompt = `Analyze support ticket. Subject: ${subject}. Body: ${message}. Return JSON: { priority: "HIGH"|"MEDIUM"|"LOW", category: string, sentiment: string, tags: string[] }`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(response.text || '{}');
}

export async function dispatchGeminiAction(action: string, payload: unknown): Promise<unknown> {
  switch (action) {
    case 'generateDisputeLetter':
      return runGenerateDisputeLetter(payload as Parameters<typeof runGenerateDisputeLetter>[0]);
    case 'analyzeCreditReportHTML':
      return runAnalyzeCreditReportHTML(payload as string);
    case 'analyzeCreditReportImage':
      return runAnalyzeCreditReportImage(
        (payload as { base64Image: string; mimeType: string }).base64Image,
        (payload as { base64Image: string; mimeType: string }).mimeType
      );
    case 'generateFundingPlan':
      return runGenerateFundingPlan(payload);
    case 'predictDisputeOutcome':
      return runPredictDisputeOutcome(payload as Parameters<typeof runPredictDisputeOutcome>[0]);
    case 'forecastCreditScore':
      return runForecastCreditScore(payload as Parameters<typeof runForecastCreditScore>[0]);
    case 'generateEducationalContent':
      return runGenerateEducationalContent(payload as string);
    case 'generateTutorResponse':
      return runGenerateTutorResponse(
        (payload as { context: string; question: string }).context,
        (payload as { context: string; question: string }).question
      );
    case 'generateQuiz':
      return runGenerateQuiz(payload as string);
    case 'analyzeInboundEmail':
      return runAnalyzeInboundEmail(payload as string);
    case 'suggestAutomationWorkflow':
      return runSuggestAutomationWorkflow(payload as string);
    case 'classifyDocument':
      return runClassifyDocument(payload as string);
    case 'parseBureauResponse':
      return runParseBureauResponse(payload as string);
    case 'analyzeBureauResponseLetter':
      return runAnalyzeBureauResponseLetter(payload as Parameters<typeof runAnalyzeBureauResponseLetter>[0]);
    case 'determineDisputeNextActions':
      return runDetermineDisputeNextActions(payload as Parameters<typeof runDetermineDisputeNextActions>[0]);
    case 'estimateDisputeScoreImpact':
      return runEstimateDisputeScoreImpact(payload as Parameters<typeof runEstimateDisputeScoreImpact>[0]);
    case 'generateStrategyTemplateByTarget':
      return runGenerateStrategyTemplateByTarget(payload as Parameters<typeof runGenerateStrategyTemplateByTarget>[0]);
    case 'orchestrateClosedLoopCreditRepair':
      return runOrchestrateClosedLoopCreditRepair(payload as Parameters<typeof runOrchestrateClosedLoopCreditRepair>[0]);
    case 'generateExecutiveSummary':
      return runGenerateExecutiveSummary(payload);
    case 'generateChatResponse':
      return runGenerateChatResponse(
        (payload as { history: unknown[]; userMessage: string }).history || [],
        (payload as { history: unknown[]; userMessage: string }).userMessage
      );
    case 'analyzeSupportTicket':
      return runAnalyzeSupportTicket(
        (payload as { subject: string; message: string }).subject,
        (payload as { subject: string; message: string }).message
      );
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
