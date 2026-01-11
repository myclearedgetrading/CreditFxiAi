
import { GoogleGenAI } from "@google/genai";
import { CreditProduct, User } from "../types";

const apiKey = process.env.API_KEY || 'MISSING_API_KEY_PLACEHOLDER';
const ai = new GoogleGenAI({ apiKey });

// In a real production app, this would fetch from a backend API or CMS.
// For now, we return an empty array or a static list of REAL affiliate partners if configured.
// Returning empty list to ensure no "fake" data is shown.
export const getCreditProducts = async (): Promise<CreditProduct[]> => {
  return []; 
};

export const getAiProductRecommendations = async (user: User, products: CreditProduct[]): Promise<CreditProduct[]> => {
  if (products.length === 0) return [];

  const prompt = `
    Act as a financial credit advisor.
    User Profile:
    - Score: ${user.creditScore.experian}
    - Negative Items: ${user.negativeItems.length}
    - Name: ${user.firstName}

    Available Products: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, type: p.type })))}

    Task:
    1. Select the top 3 products that will maximize score improvement for this specific user.
    2. Assign a 'matchScore' (0-100) for each.
    3. Provide a 'aiReasoning' (1 short sentence) for why it fits.

    Return JSON array ONLY:
    [{ "id": "prod_x", "matchScore": 95, "aiReasoning": "..." }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const recommendations = JSON.parse(response.text || "[]");

    const rankedProducts = products.map(p => {
      const rec = recommendations.find((r: any) => r.id === p.id);
      if (rec) {
        return { ...p, matchScore: rec.matchScore, aiReasoning: rec.aiReasoning };
      }
      return { ...p, matchScore: 50, aiReasoning: "Standard option available for your profile." };
    });

    return rankedProducts.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  } catch (error) {
    console.error("Gemini Market Error:", error);
    return products;
  }
};
