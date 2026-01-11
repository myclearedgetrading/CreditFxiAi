
import { GoogleGenAI } from "@google/genai";
import { 
  User, NegativeItem, DisputeStrategy, Bureau, CreditAnalysisResult, 
  DisputePrediction, ScoreForecastPoint, EmailAnalysisResult, AutomationWorkflow,
  DocumentClassification, BureauResponseResult, QuizQuestion, KnowledgeArticle,
  TicketAnalysis, ModelFeedback
} from "../types";

// Check if we are in Demo Mode (No API Key)
const apiKey = process.env.API_KEY || 'MISSING_API_KEY_PLACEHOLDER';
const isDemoMode = !process.env.API_KEY || process.env.API_KEY === 'MISSING_API_KEY_PLACEHOLDER';

// Initialize AI only if we might use it, otherwise use a dummy to prevent init errors
const ai = isDemoMode ? {} as any : new GoogleGenAI({ apiKey });

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
  
  // 1. DEMO MODE BYPASS
  if (isDemoMode) {
    console.log("Demo Mode: Generating mock dispute letter.");
    await new Promise(r => setTimeout(r, 1500)); // Simulate AI thinking time
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return `[${client.firstName} ${client.lastName}]
[Your Current Address]
[City, State, Zip Code]

${today}

${targetBureau}
Dispute Resolution Department
P.O. Box [Bureau Specific Address]
[City, State, Zip Code]

Re: Dispute of Inaccurate Information
SSN: [XXX-XX-XXXX]
DOB: [MM/DD/YYYY]

To Whom It May Concern:

I am writing to you today to exercise my rights under the Fair Credit Reporting Act (FCRA), specifically Section 609. I have recently reviewed my credit report and identified information that is inaccurate, incomplete, or unverifiable.

I am formally disputing the following item:

Creditor Name: ${item.creditor}
Account Number: ${item.accountNumber}
Amount: $${item.amount}
Type: ${item.type}

Reason for Dispute:
${strategy === DisputeStrategy.METRO2 
  ? 'This account does not comply with the Metro 2 reporting standards required by the CDIA. Specifically, the Payment History Profile and Compliance Condition Code appear inconsistent. I demand a physical audit of the raw data transmission.' 
  : 'I have no record of this account with the details provided. I request that you validate this debt by providing the original consumer contract with my signature. If you cannot verify it within 30 days as required by law, it must be deleted.'}

Please investigate this matter immediately. If you are unable to verify the accuracy of this information with physical proof (not just e-OSCAR automated verification), please remove it from my credit file.

Please send me an updated copy of my credit report showing this item has been deleted or corrected.

Sincerely,

${client.firstName} ${client.lastName}`;
  }

  // 2. REAL AI LOGIC
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
    ${additionalContext}
    
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
    console.error("AI Error:", error);
    throw new Error("Failed to generate dispute letter. Please check API key.");
  }
};

export const analyzeCreditReportHTML = async (htmlContent: string): Promise<CreditAnalysisResult> => {
  if (isDemoMode) {
      await new Promise(r => setTimeout(r, 2000));
      return getMockCreditAnalysis();
  }

  const prompt = `
    Analyze this raw HTML credit report. You are an expert credit analyst.
    
    Data to Extract:
    1. Identify all negative items (Collections, Late Payments, Charge-offs).
    2. Compare data across bureaus (Equifax, Experian, TransUnion) to find factual discrepancies.
    3. Calculate potential score improvement.

    Return JSON ONLY.
  `;

  try {
    const truncatedHTML = htmlContent.length > 300000 ? htmlContent.substring(0, 300000) : htmlContent;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt + "\n\nHTML CONTENT:\n" + truncatedHTML,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return getMockCreditAnalysis();
  }
};

export const analyzeCreditReportImage = async (base64Image: string, mimeType: string): Promise<CreditAnalysisResult> => {
  if (isDemoMode) {
      await new Promise(r => setTimeout(r, 2500));
      return getMockCreditAnalysis();
  }

  const prompt = `
    Analyze this credit report image for the user. Act as their personal FICO score coach.
    Extract negative items, find inconsistencies, and recommend strategies.
    Return JSON.
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
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "{}";
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as CreditAnalysisResult;

  } catch (error) {
    return getMockCreditAnalysis();
  }
};

// --- Helper for Mock Data ---
function getMockCreditAnalysis(): CreditAnalysisResult {
    return {
      summary: { totalNegativeItems: 3, estimatedScoreImprovement: 65, utilizationRate: 42 },
      negativeItems: [
        { creditor: "Midland Funding", accountType: "Collection", amount: 1250, bureau: "Equifax", date: "2023-05-15" },
        { creditor: "Capital One", accountType: "Late Payment", amount: 0, bureau: "TransUnion", date: "2023-01-20" },
        { creditor: "Chase Bank", accountType: "Charge Off", amount: 4500, bureau: "Experian", date: "2022-11-01" }
      ],
      discrepancies: [
        { type: "BALANCE_MISMATCH", description: "Midland Funding balance varies by $50 across bureaus.", severity: "HIGH", itemsInvolved: ["Midland Funding"] }
      ],
      recommendations: [
        { 
          itemId: "1", 
          creditorName: "Midland Funding", 
          recommendedStrategy: "Debt Validation", 
          confidenceScore: 85, 
          reasoning: "Third-party collectors often lack original documentation.", 
          bureauToTarget: "Equifax" 
        }
      ],
      actionPlan: [
        { phase: "Day 1-30", actions: ["Send Validation Letter to Midland", "Dispute Capital One Late"], expectedOutcome: "Investigation Initiated" }
      ]
    };
}

export const generateFundingPlan = async (businessData: any): Promise<any> => {
  if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1000));
      return { 
        currentTier: 'Tier 1', 
        recommendedSources: [{ name: "Uline", type: "Net-30", likelihood: "High" }, { name: "Grainger", type: "Net-30", likelihood: "High" }], 
        complianceIssues: ["Ensure EIN is active", "Get a D-U-N-S Number"] 
      };
  }
  // ... Real implementation would go here
  return {};
};

export const predictDisputeOutcome = async (itemType: string, itemAge: string, bureau: string, strategy: string): Promise<DisputePrediction> => {
  if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1000));
      return {
        probability: 72,
        confidenceLevel: "High",
        keyFactors: ["Item age > 2 years favors deletion", "Factual error in balance detected"],
        estimatedDaysToResult: 35
      };
  }
  // ... Real implementation
  return {} as any;
};

export const forecastCreditScore = async (currentScore: number, negativeItemsCount: number, utilization: number): Promise<ScoreForecastPoint[]> => {
  if (isDemoMode) {
      await new Promise(r => setTimeout(r, 1000));
      return [
          { month: 'Month 1', bestCase: currentScore + 5, likelyCase: currentScore, worstCase: currentScore - 5 },
          { month: 'Month 2', bestCase: currentScore + 25, likelyCase: currentScore + 10, worstCase: currentScore },
          { month: 'Month 3', bestCase: currentScore + 45, likelyCase: currentScore + 25, worstCase: currentScore + 5 },
          { month: 'Month 4', bestCase: currentScore + 60, likelyCase: currentScore + 40, worstCase: currentScore + 10 },
          { month: 'Month 5', bestCase: currentScore + 75, likelyCase: currentScore + 55, worstCase: currentScore + 15 },
          { month: 'Month 6', bestCase: currentScore + 90, likelyCase: currentScore + 70, worstCase: currentScore + 20 },
      ];
  }
  return [];
};

export const generateEducationalContent = async (topic: string): Promise<string> => {
  if (isDemoMode) return `# ${topic}\n\nThis is a generated guide about ${topic}. In demo mode, this content is static. Connect an API Key to get real-time AI articles.`;
  // ... Real implementation
  return "";
};

export const generateTutorResponse = async (context: string, question: string): Promise<string> => {
  if (isDemoMode) return "I am currently in Demo Mode. I can't answer specific questions dynamically, but I suggest reviewing the course material!";
  // ... Real implementation
  return "";
};

export const searchKnowledgeBase = async (query: string): Promise<KnowledgeArticle[]> => { return []; };
export const submitModelFeedback = async (feedback: any): Promise<boolean> => { return true; };

export const generateQuiz = async (topic: string): Promise<QuizQuestion> => {
    if (isDemoMode) {
        return {
            question: "What percentage of your FICO score is determined by Payment History?",
            options: ["10%", "30%", "35%", "15%"],
            correctIndex: 2,
            explanation: "Payment History is the largest factor, making up 35% of your total score."
        };
    }
    return {} as any;
};

export const analyzeInboundEmail = async (emailContent: string): Promise<EmailAnalysisResult> => {
  if (isDemoMode) {
      return {
          priority: "MEDIUM",
          category: "General Inquiry",
          sentiment: "Neutral",
          suggestedResponse: "Thank you for reaching out. We have received your query and will get back to you shortly.",
          actionItems: ["Check client file", "Schedule follow-up"]
      };
  }
  return {} as any;
};

export const suggestAutomationWorkflow = async (goal: string): Promise<Partial<AutomationWorkflow>> => {
    if (isDemoMode) {
        return {
          name: "Demo Workflow: " + goal.substring(0, 15) + "...",
          description: "Automated workflow generated in demo mode.",
          trigger: "ON_STATUS_CHANGE",
          conditions: [{ field: 'status', operator: 'equals', value: 'pending' }],
          actions: [{type: "SEND_EMAIL", config: { template: 'update' }}]
      };
    }
    return {} as any;
};

export const classifyDocument = async (filename: string): Promise<DocumentClassification> => {
     if (isDemoMode) return { category: "CREDIT_REPORT", confidence: 0.98 };
     return {} as any;
};

export const parseBureauResponse = async (content: string): Promise<BureauResponseResult> => { return {} as any; };

export const generateExecutiveSummary = async (data: any): Promise<string> => {
    if (isDemoMode) return "Your credit profile is showing positive trends. Focus on removing the remaining collection account to see significant score improvement.";
    return "";
};

export const generateChatResponse = async (history: any[], userMessage: string): Promise<string> => {
    if (isDemoMode) return "I'm in demo mode! I can help you navigate the app, but I can't generate new text right now.";
    return "";
};

export const analyzeSupportTicket = async (subject: string, message: string): Promise<TicketAnalysis> => {
    if (isDemoMode) return { priority: "HIGH", category: "Support", sentiment: "Neutral", tags: ["demo"] };
    return {} as any;
};
