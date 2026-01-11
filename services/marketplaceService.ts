
import { GoogleGenAI } from "@google/genai";
import { CreditProduct, User } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getCreditProducts = async (): Promise<CreditProduct[]> => {
  // This represents the "database" of available products.
  return [
    {
      id: 'prod-1',
      name: 'CreditBuilder Plus',
      issuer: 'Chime',
      type: 'SECURED_CARD',
      description: 'No credit check to apply. Money you move to Credit Builder is the amount you can spend.',
      annualFee: 0,
      minDeposit: 200,
      creditImpact: 'HIGH',
      approvalOdds: 'EXCELLENT',
      features: ['No Annual Fee', 'No Interest', 'Build Credit Fast'],
      imageUrl: 'placeholder',
      applyLink: '#'
    },
    {
      id: 'prod-2',
      name: 'Platinum Secured',
      issuer: 'Capital One',
      type: 'SECURED_CARD',
      description: 'No annual fee and a refundable security deposit. Reports to all 3 bureaus.',
      annualFee: 0,
      minDeposit: 49,
      creditImpact: 'HIGH',
      approvalOdds: 'GOOD',
      features: ['Low Deposit', 'Automatic Credit Line Reviews', 'Mobile App'],
      imageUrl: 'placeholder',
      applyLink: '#'
    },
    {
      id: 'prod-3',
      name: 'Self Visa®',
      issuer: 'Self',
      type: 'LOAN',
      description: 'Build credit while you save. No hard pull. Unlock the card after 3 months.',
      annualFee: 25,
      minDeposit: 0,
      creditImpact: 'MEDIUM',
      approvalOdds: 'EXCELLENT',
      features: ['No Hard Pull', 'Savings Account', 'Card Access'],
      imageUrl: 'placeholder',
      applyLink: '#'
    },
    {
      id: 'prod-4',
      name: 'BoomPay',
      issuer: 'Boom',
      type: 'RENT_REPORTING',
      description: 'Report your past and future rent payments to all 3 major credit bureaus.',
      annualFee: 24,
      minDeposit: 0,
      creditImpact: 'MEDIUM',
      approvalOdds: 'EXCELLENT',
      features: ['Rent Reporting', 'No Hard Pull', 'Instant Verification'],
      imageUrl: 'placeholder',
      applyLink: '#'
    }
  ]; 
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
