
import { GoogleGenAI } from "@google/genai";
import { 
  User, NegativeItem, DisputeStrategy, Bureau, CreditAnalysisResult, 
  DisputePrediction, ScoreForecastPoint, EmailAnalysisResult, AutomationWorkflow,
  DocumentClassification, BureauResponseResult, QuizQuestion, KnowledgeArticle,
  TicketAnalysis
} from "../types";

// Initialize AI directly. Expects process.env.API_KEY to be set.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

interface GenerateLetterParams {
  client: User;
  item: NegativeItem;
  strategy: DisputeStrategy;
  targetBureau: Bureau;
}

export const generateDisputeLetter = async ({
  client,
  item,
  strategy,
  targetBureau
}: GenerateLetterParams): Promise<string> => {
  
  let additionalContext = "";
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
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      temperature: 0.7,
    }
  });

  return response.text || "Failed to generate letter content.";
};

export const analyzeCreditReportHTML = async (htmlContent: string): Promise<CreditAnalysisResult> => {
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
    model: 'gemini-3-pro-preview',
    contents: prompt + "\n\nHTML CONTENT:\n" + truncatedHTML,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeCreditReportImage = async (base64Image: string, mimeType: string): Promise<CreditAnalysisResult> => {
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
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: mimeType, data: base64Image } },
        { text: prompt }
      ]
    },
    config: { responseMimeType: "application/json" }
  });

  const text = response.text || "{}";
  const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonString) as CreditAnalysisResult;
};

export const generateFundingPlan = async (businessData: any): Promise<any> => {
  const prompt = `
    Analyze this business profile and generate a funding roadmap.
    Data: ${JSON.stringify(businessData)}
    
    Return JSON with:
    - currentTier (Tier 1, 2, 3, or 4)
    - recommendedSources (List of specific vendors/cards)
    - complianceIssues (List of missing requirements)
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

export const predictDisputeOutcome = async (itemType: string, itemAge: string, bureau: string, strategy: string): Promise<DisputePrediction> => {
  const prompt = `
    Predict the dispute outcome for:
    Item: ${itemType}
    Age: ${itemAge}
    Bureau: ${bureau}
    Strategy: ${strategy}
    
    Return JSON: { probability: number (0-100), confidenceLevel: string, keyFactors: string[], estimatedDaysToResult: number }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

export const forecastCreditScore = async (currentScore: number, negativeItemsCount: number, utilization: number): Promise<ScoreForecastPoint[]> => {
  const prompt = `
    Forecast credit score over next 6 months.
    Current: ${currentScore}, Negatives: ${negativeItemsCount}, Utilization: ${utilization}%
    
    Return JSON array of objects: { month: string, bestCase: number, likelyCase: number, worstCase: number }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "[]");
};

export const generateEducationalContent = async (topic: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a comprehensive educational guide about: ${topic}. Format in Markdown. Keep it under 500 words.`
  });
  return response.text || "";
};

export const generateTutorResponse = async (context: string, question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Context: ${context}\n\nUser Question: ${question}\n\nAnswer as a helpful credit repair tutor.`
  });
  return response.text || "";
};

export const searchKnowledgeBase = async (query: string): Promise<KnowledgeArticle[]> => { 
  // Placeholder for RAG implementation
  return []; 
};

export const submitModelFeedback = async (feedback: any): Promise<boolean> => { return true; };

export const generateQuiz = async (topic: string): Promise<QuizQuestion> => {
  const prompt = `Generate a multiple choice question about ${topic}. Return JSON: { question: string, options: string[], correctIndex: number, explanation: string }`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeInboundEmail = async (emailContent: string): Promise<EmailAnalysisResult> => {
  const prompt = `
    Analyze this inbound email: "${emailContent}"
    Return JSON: { priority: "HIGH"|"MEDIUM"|"LOW", category: string, sentiment: string, suggestedResponse: string, actionItems: string[] }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const suggestAutomationWorkflow = async (goal: string): Promise<Partial<AutomationWorkflow>> => {
  const prompt = `
    Create an automation workflow for goal: "${goal}"
    Return JSON: { name: string, description: string, trigger: string, conditions: object[], actions: object[] }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const classifyDocument = async (filename: string): Promise<DocumentClassification> => {
  const prompt = `Classify this file based on name: "${filename}". Return JSON: { category: string, confidence: number }`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const parseBureauResponse = async (content: string): Promise<BureauResponseResult> => { 
  const prompt = `Parse this credit bureau response letter. Return JSON: { bureau: string, date: string, outcomes: [{ creditor: string, accountNumber: string, outcome: string }] }`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt + `\n\n${content}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateExecutiveSummary = async (data: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 2-sentence executive summary for this user's credit progress: ${JSON.stringify(data)}`
  });
  return response.text || "";
};

export const generateChatResponse = async (history: any[], userMessage: string): Promise<string> => {
  const chat = ai.chats.create({ model: 'gemini-3-flash-preview' });
  // In a real implementation, we would hydrate history here.
  const result = await chat.sendMessage({ message: userMessage });
  return result.text || "";
};

export const analyzeSupportTicket = async (subject: string, message: string): Promise<TicketAnalysis> => {
  const prompt = `Analyze support ticket. Subject: ${subject}. Body: ${message}. Return JSON: { priority: "HIGH"|"MEDIUM"|"LOW", category: string, sentiment: string, tags: string[] }`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};
