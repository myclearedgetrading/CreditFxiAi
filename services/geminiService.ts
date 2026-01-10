
import { GoogleGenAI } from "@google/genai";
import { 
  User, NegativeItem, DisputeStrategy, Bureau, CreditAnalysisResult, 
  DisputePrediction, ScoreForecastPoint, EmailAnalysisResult, AutomationWorkflow,
  DocumentClassification, BureauResponseResult, QuizQuestion, KnowledgeArticle,
  TicketAnalysis, ModelFeedback
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const prompt = `
    You are an expert Credit Repair Coach assisting a user in repairing their own credit.
    
    Task: Write a personal dispute letter from the user to ${targetBureau}.
    
    User Details:
    Name: ${client.firstName} ${client.lastName}
    Current Address: [User Address Placeholder]
    SSN: [XXX-XX-XXXX]
    DOB: [MM/DD/YYYY]
    
    Negative Item to Dispute:
    Creditor: ${item.creditor}
    Account Number: ${item.accountNumber}
    Amount: $${item.amount}
    Date Reported: ${item.dateReported}
    Error/Issue: ${item.type}
    
    Strategy to use: ${strategy}
    
    Instructions:
    1. Write in the FIRST PERSON ("I am writing to dispute...").
    2. Be firm but professional.
    3. Cite relevant FCRA sections (Section 609, 611) as a consumer asserting their rights.
    4. Demand validation or removal.
    5. Do not use complex legal jargon that sounds like a lawyer wrote it; it must sound like an educated consumer.
    6. Return only the body of the letter.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate letter content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate dispute letter via AI.");
  }
};

export const analyzeCreditReportImage = async (base64Image: string, mimeType: string): Promise<CreditAnalysisResult> => {
  const prompt = `
    Analyze this credit report image for the user. Act as their personal FICO score coach.
    
    Perform the following tasks:
    1. OCR: Extract negative items.
    2. Discrepancy Check: Find inconsistencies across bureaus.
    3. Strategy: Recommend strategies for the user to do themselves.
    4. Plan: Create a DIY 3-month action plan.

    Return the output STRICTLY in this JSON format:
    {
      "summary": {
        "totalNegativeItems": number,
        "estimatedScoreImprovement": number,
        "utilizationRate": number
      },
      "negativeItems": [
        { "creditor": string, "accountType": string, "amount": number, "bureau": string, "date": string }
      ],
      "discrepancies": [
        { "type": "BALANCE_MISMATCH" | "DATE_MISMATCH" | "STATUS_CONFLICT", "description": string, "severity": "HIGH" | "MEDIUM", "itemsInvolved": [string] }
      ],
      "recommendations": [
        { 
          "itemId": string, 
          "creditorName": string, 
          "recommendedStrategy": "Factual Dispute" | "Debt Validation" | "Goodwill Adjustment" | "Late Payment Removal", 
          "confidenceScore": number, 
          "reasoning": string,
          "bureauToTarget": "Equifax" | "Experian" | "TransUnion"
        }
      ],
      "actionPlan": [
        { "phase": "Day 1-30", "actions": [string], "expectedOutcome": string },
        { "phase": "Day 31-60", "actions": [string], "expectedOutcome": string },
        { "phase": "Day 61-90", "actions": [string], "expectedOutcome": string }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    try {
      const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonString) as CreditAnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, text);
      throw new Error("Failed to parse AI response.");
    }

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze credit report image.");
  }
};

export const generateFundingPlan = async (businessData: any): Promise<any> => {
  const prompt = `
    Act as a Business Funding Advisor.
    Analyze the user's business profile: ${JSON.stringify(businessData)}
    
    1. Identify their current "Funding Tier" (1-4).
    2. List 3 specific funding sources they are likely to be approved for (e.g., Uline, Nav, Amex).
    3. Provide a checklist of missing compliance items.

    Return JSON ONLY:
    {
      "currentTier": "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4",
      "recommendedSources": [
        { "name": string, "type": string, "likelihood": "High" | "Medium" }
      ],
      "complianceIssues": [string]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error(e);
    return { currentTier: 'Tier 1', recommendedSources: [], complianceIssues: [] };
  }
};

export const predictDisputeOutcome = async (
  itemType: string, 
  itemAge: string, 
  bureau: string, 
  strategy: string
): Promise<DisputePrediction> => {
  const prompt = `
    Act as a Predictive Analytics Model for Credit Repair.
    Predict success for a consumer disputing:
    - Item: ${itemType} (${itemAge} old)
    - Bureau: ${bureau}
    - Strategy: ${strategy}

    Return JSON ONLY:
    {
      "probability": number (0-100),
      "confidenceLevel": "High" | "Medium" | "Low",
      "keyFactors": [string],
      "estimatedDaysToResult": number
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Prediction Error", e);
    throw new Error("Prediction failed");
  }
};

export const forecastCreditScore = async (currentScore: number, negativeItemsCount: number, utilization: number): Promise<ScoreForecastPoint[]> => {
    const prompt = `Act as FICO Simulator. Score: ${currentScore}, Negatives: ${negativeItemsCount}, Util: ${utilization}%. Forecast 6 months JSON array.`;
     try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return [] }
};

export const generateEducationalContent = async (topic: string): Promise<string> => {
  const prompt = `Write a short guide for a consumer on: "${topic}". Markdown format.`;
   try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "";
  } catch (e) { return "" }
};

export const searchKnowledgeBase = async (query: string): Promise<KnowledgeArticle[]> => {
    const prompt = `Generate 3 knowledge base articles for query: "${query}". Return JSON array.`;
    try {
        const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
};

export const submitModelFeedback = async (feedback: any): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => resolve(true), 100));
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion> => {
     const prompt = `Generate 1 quiz question about "${topic}" JSON: {question, options[], correctIndex, explanation}`;
    try {
        const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) { throw e; }
};

export const analyzeInboundEmail = async (emailContent: string): Promise<EmailAnalysisResult> => {
  const prompt = `Analyze this email. Return JSON: { priority: "HIGH"|"MEDIUM"|"LOW", category: string, sentiment: string, suggestedResponse: string, actionItems: string[] } \n\nEmail: ${emailContent}`;
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
};

export const suggestAutomationWorkflow = async (goal: string): Promise<Partial<AutomationWorkflow>> => {
    const prompt = `Suggest automation workflow for goal: "${goal}". Return JSON: { name, description, trigger, conditions: [{field, operator, value}], actions: [{type, config}] }`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
};

export const classifyDocument = async (filename: string): Promise<DocumentClassification> => {
     const prompt = `Classify document filename: "${filename}". Return JSON: { category: string, confidence: number }`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
};

export const parseBureauResponse = async (content: string): Promise<BureauResponseResult> => {
    const prompt = `Parse bureau letter content. Return JSON: { bureau, date, outcomes: [{creditor, accountNumber, outcome}] } \n\n${content}`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
};

export const generateExecutiveSummary = async (data: any): Promise<string> => {
    const prompt = `Generate executive summary for dashboard data: ${JSON.stringify(data)}. Keep it professional and concise.`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const generateChatResponse = async (history: any[], userMessage: string): Promise<string> => {
    const prompt = `You are a helpful Credit Repair assistant. Chat history: ${JSON.stringify(history)}. User: ${userMessage}. Respond.`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const analyzeSecurityLogs = async (logs: any[]): Promise<string> => {
     const prompt = `Analyze these security logs for threats. Summarize findings. Logs: ${JSON.stringify(logs)}`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const analyzeSupportTicket = async (subject: string, message: string): Promise<TicketAnalysis> => {
    const prompt = `Analyze support ticket. Return JSON: { priority: "HIGH"|"MEDIUM"|"LOW"|"CRITICAL", category, sentiment, tags: [] }. Subject: ${subject}. Message: ${message}`;
    try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) { throw e; }
};
