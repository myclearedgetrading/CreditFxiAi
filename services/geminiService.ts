import { GoogleGenAI } from "@google/genai";
import { 
  Client, NegativeItem, DisputeStrategy, Bureau, CreditAnalysisResult, 
  DisputePrediction, ScoreForecastPoint, EmailAnalysisResult, AutomationWorkflow,
  DocumentClassification, BureauResponseResult, QuizQuestion, KnowledgeArticle,
  TicketAnalysis
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateLetterParams {
  client: Client;
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
    You are an expert Credit Repair Specialist and Legal Assistant well-versed in the FCRA (Fair Credit Reporting Act) and FDCPA (Fair Debt Collection Practices Act).
    
    Task: Write a formal, legally sound dispute letter to ${targetBureau}.
    
    Client Details:
    Name: ${client.firstName} ${client.lastName}
    Current Address: [Client Address Placeholder]
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
    1. Use a professional, firm, and legal tone.
    2. Cite relevant FCRA sections (e.g., Section 609, 611) based on the strategy.
    3. Demand validation of the debt or removal of the item if verification cannot be provided within 30 days.
    4. Do not include any conversational filler. Return only the body of the letter.
    5. Leave placeholders like [Date], [Signature] where appropriate.
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

export const analyzeCreditReport = async (summaryText: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following credit report summary notes and suggest the top 3 actions to improve the score:\n\n${summaryText}`,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing report.";
  }
}

export const analyzeCreditReportImage = async (base64Image: string, mimeType: string): Promise<CreditAnalysisResult> => {
  const prompt = `
    Analyze this credit report image. Act as a senior FICO score analyst and FCRA expert.
    
    Perform the following tasks:
    1. OCR: Extract negative items (collections, charge-offs, late payments).
    2. Discrepancy Check: Find inconsistencies (e.g., different balances for same account across bureaus, date mismatches).
    3. Strategy: Recommend the best dispute strategy for each item based on its type and age.
    4. Plan: Create a 3-month action plan.

    Return the output STRICTLY in this JSON format (no markdown code blocks, just raw JSON):
    {
      "summary": {
        "totalNegativeItems": number,
        "estimatedScoreImprovement": number (conservative estimate),
        "utilizationRate": number (estimate from avail data)
      },
      "negativeItems": [
        { "creditor": string, "accountType": string, "amount": number, "bureau": string, "date": string }
      ],
      "discrepancies": [
        { "type": "BALANCE_MISMATCH" | "DATE_MISMATCH" | "STATUS_CONFLICT", "description": string, "severity": "HIGH" | "MEDIUM", "itemsInvolved": [string] }
      ],
      "recommendations": [
        { 
          "itemId": string (unique), 
          "creditorName": string, 
          "recommendedStrategy": "Factual Dispute" | "Debt Validation" | "Goodwill Adjustment" | "Late Payment Removal", 
          "confidenceScore": number (0-100), 
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

export const predictDisputeOutcome = async (
  itemType: string, 
  itemAge: string, 
  bureau: string, 
  strategy: string
): Promise<DisputePrediction> => {
  const prompt = `
    Act as a Predictive Analytics Model for Credit Repair.
    Predict the success rate (deletion or update) of a dispute based on these parameters:
    - Item Type: ${itemType}
    - Age of Item: ${itemAge}
    - Bureau: ${bureau}
    - Dispute Strategy: ${strategy}

    Return JSON ONLY:
    {
      "probability": number (0-100),
      "confidenceLevel": "High" | "Medium" | "Low",
      "keyFactors": [string (3 bullet points explaining why)],
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

export const forecastCreditScore = async (
  currentScore: number, 
  negativeItemsCount: number, 
  utilization: number
): Promise<ScoreForecastPoint[]> => {
  const prompt = `
    Act as a FICO Score Simulator.
    Current Score: ${currentScore}
    Negative Items: ${negativeItemsCount}
    Credit Utilization: ${utilization}%

    Generate a 6-month score forecast for 3 scenarios: Best Case (aggressive deletions), Likely Case (mixed results), Worst Case (no changes).
    Return strictly a JSON array of 6 objects (one for each future month):
    [
      { "month": "Month 1", "bestCase": number, "likelyCase": number, "worstCase": number },
      ...
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Forecast Error", e);
    throw new Error("Forecasting failed");
  }
};

export const analyzeInboundEmail = async (emailBody: string): Promise<EmailAnalysisResult> => {
  const prompt = `
    Act as an AI Customer Service Assistant for a Credit Repair Company.
    Analyze the following inbound email from a client.
    
    Email Content:
    "${emailBody}"

    Tasks:
    1. Categorize the email (Inquiry, Complaint, Update, Other).
    2. Determine priority (High/Medium/Low).
    3. Analyze sentiment (Positive/Neutral/Negative).
    4. Draft a professional, empathetic response.
    5. Extract 2-3 specific action items for the specialist.

    Return JSON ONLY:
    {
      "category": "INQUIRY" | "COMPLAINT" | "UPDATE" | "OTHER",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "suggestedResponse": string,
      "actionItems": [string]
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
    console.error("Email Analysis Error", e);
    throw new Error("Failed to analyze email");
  }
};

export const suggestAutomationWorkflow = async (goalDescription: string): Promise<Partial<AutomationWorkflow>> => {
  const prompt = `
    Act as an Automation Architect. The user wants to create an automated workflow for their Credit Repair CRM.
    
    User Goal: "${goalDescription}"

    Based on this goal, construct a JSON configuration for the workflow.
    Available Triggers: SCORE_CHANGE, DISPUTE_STATUS_UPDATE, NO_LOGIN_DETECTED, NEW_DOCUMENT_UPLOAD, PAYMENT_FAILED
    Available Actions: SEND_EMAIL, CREATE_TASK, SEND_SMS, UPDATE_STATUS, NOTIFY_SLACK

    Return JSON ONLY:
    {
      "name": string (creative title),
      "description": string,
      "trigger": string (one of the enum values),
      "conditions": [{ "field": string, "operator": string, "value": string }],
      "actions": [{ "type": string, "config": object }]
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
    console.error("Workflow Suggestion Error", e);
    throw new Error("Failed to suggest workflow");
  }
};

export const classifyDocument = async (fileName: string): Promise<DocumentClassification> => {
  const prompt = `
    Act as a Document Classification AI for a Credit Repair system.
    Analyze the filename and context to categorize the document.

    Filename: "${fileName}"

    Categories:
    - ID_CARD (Driver's License, Passport, SSN Card)
    - PROOF_OF_ADDRESS (Utility Bill, Bank Statement)
    - CREDIT_REPORT (PDF report from IdentityIQ, SmartCredit, etc.)
    - BUREAU_RESPONSE (Letter from Equifax, Experian, or TransUnion)
    - OTHER

    Return JSON ONLY:
    {
      "category": "ID_CARD" | "PROOF_OF_ADDRESS" | "CREDIT_REPORT" | "BUREAU_RESPONSE" | "OTHER",
      "confidence": number (0-100),
      "extractedData": { "summary": "string" }
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
    console.error("Document Classify Error", e);
    throw new Error("Failed to classify document");
  }
};

export const parseBureauResponse = async (text: string): Promise<BureauResponseResult> => {
  const prompt = `
    Act as an OCR Parser for Bureau Dispute Results.
    Analyze the text content of a response letter from a credit bureau.

    Text: "${text}"

    Tasks:
    1. Identify the Bureau (Equifax, Experian, TransUnion).
    2. Extract the date of the letter.
    3. List each item disputed and the outcome (Deleted, Verified, Updated, Remains).

    Return JSON ONLY:
    {
      "bureau": "Equifax" | "Experian" | "TransUnion",
      "date": "YYYY-MM-DD",
      "outcomes": [
        { "creditor": string, "accountNumber": string, "outcome": "DELETED" | "VERIFIED" | "UPDATED" | "REMAINS" }
      ]
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
    console.error("Response Parse Error", e);
    throw new Error("Failed to parse bureau response");
  }
};

export const generateExecutiveSummary = async (stats: any): Promise<string> => {
  const prompt = `
    Act as a Chief Data Officer. Summarize the following business performance stats for the Executive Dashboard.
    Focus on growth, areas of concern, and strategic recommendations. Keep it under 100 words.

    Stats: ${JSON.stringify(stats)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "No summary generated.";
  } catch (e) {
    return "Failed to generate summary.";
  }
}

export const generateChatResponse = async (history: any[], newMessage: string): Promise<string> => {
  const prompt = `
    You are 'CreditFix Bot', a helpful, professional, and empathetic AI assistant for a credit repair company.
    
    Context:
    - You are talking to a client.
    - Be concise and friendly.
    - If the user asks about 'status', assume you need to check their portal (simulate this).
    - If you don't know, suggest they book a call with their specialist.

    Chat History:
    ${history.map((m: any) => `${m.sender}: ${m.text}`).join('\n')}
    User: ${newMessage}
    Bot:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "I'm having trouble connecting right now.";
  } catch (e) {
    console.error(e);
    return "Service unavailable.";
  }
};

export const generateEducationalContent = async (topic: string): Promise<string> => {
  const prompt = `
    Write a short, engaging educational article (approx 200 words) for a credit repair client about: "${topic}".
    Use markdown formatting. Include 3 bullet points on "Key Takeaways".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Failed to generate content.";
  } catch (e) {
    return "Error generating article.";
  }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion> => {
  const prompt = `
    Generate a multiple-choice quiz question about "${topic}" in the context of personal finance and credit repair.
    
    Return JSON ONLY:
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": number (0-3),
      "explanation": "string (why the answer is correct)"
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
    throw new Error("Failed to generate quiz");
  }
};

export const analyzeSecurityLogs = async (logs: any[]): Promise<string> => {
  const prompt = `
    Act as a Cybersecurity Analyst.
    Review these recent system logs for anomalies, potential breaches, or suspicious activity.
    Logs: ${JSON.stringify(logs)}

    Provide a concise summary (under 50 words) and mark status as 'Secure' or 'Action Required'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "No analysis available.";
  } catch (e) {
    return "Failed to analyze security logs.";
  }
};

// --- KNOWLEDGE BASE FUNCTIONS ---

export const searchKnowledgeBase = async (query: string): Promise<KnowledgeArticle[]> => {
  // Simulate RAG (Retrieval Augmented Generation) by generating relevant "found" articles based on the query
  const prompt = `
    Act as a Knowledge Base Search Engine for a Credit Repair platform.
    User Query: "${query}"

    Generate 3 realistic knowledge base articles that would match this query.
    Categories can be: FCRA, FDCPA, PLAYBOOK, SCRIPTS, CASE_STUDY.

    Return JSON ONLY:
    [
      {
        "id": "string",
        "title": "string",
        "category": "FCRA" | "FDCPA" | "PLAYBOOK" | "SCRIPTS" | "CASE_STUDY",
        "summary": "string (2 sentences)",
        "content": "string (full markdown content, approx 100 words)",
        "tags": ["string", "string"],
        "lastUpdated": "YYYY-MM-DD",
        "confidenceScore": number (0-100)
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const submitModelFeedback = async (feedback: any): Promise<boolean> => {
  // Simulate sending feedback to a training endpoint
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
};

// --- SUPPORT AI FUNCTIONS ---

export const analyzeSupportTicket = async (subject: string, message: string): Promise<TicketAnalysis> => {
  const prompt = `
    Act as a Support Triage AI. Analyze the following ticket.
    
    Subject: "${subject}"
    Message: "${message}"

    Tasks:
    1. Categorize: BILLING, DISPUTE_UPDATE, TECHNICAL, GENERAL, LEGAL
    2. Priority: LOW, MEDIUM, HIGH, CRITICAL
    3. Sentiment: POSITIVE, NEUTRAL, NEGATIVE
    4. Draft Reply: Professional response.
    5. Tags: 2-3 relevant tags.

    Return JSON ONLY.
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
    throw new Error("Failed to analyze ticket");
  }
};