
import { GoogleGenAI } from "@google/genai";
import { CreditProduct, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_PRODUCTS: CreditProduct[] = [
  {
    id: 'prod_1',
    name: 'OpnSky Secured Visa',
    issuer: 'Capital Bank',
    type: 'SECURED_CARD',
    description: 'No credit check required. Refundable deposit becomes your credit line.',
    annualFee: 35,
    apr: '22.4% Variable',
    minDeposit: 200,
    creditImpact: 'HIGH',
    approvalOdds: 'EXCELLENT',
    features: ['No Credit Check', 'Reports to all 3 Bureaus', 'Graduation to Unsecured'],
    imageUrl: 'https://via.placeholder.com/150/4f46e5/ffffff?text=OpnSky',
    applyLink: '#'
  },
  {
    id: 'prod_2',
    name: 'Self Credit Builder',
    issuer: 'Lead Bank',
    type: 'LOAN',
    description: 'Build credit while you save. No hard pull. Money unlocks at end of term.',
    annualFee: 25,
    apr: '15.9%',
    creditImpact: 'HIGH',
    approvalOdds: 'EXCELLENT',
    features: ['Force Savings', 'No Hard Pull', 'Installment History'],
    imageUrl: 'https://via.placeholder.com/150/0ea5e9/ffffff?text=Self',
    applyLink: '#'
  },
  {
    id: 'prod_3',
    name: 'RentalReporters',
    issuer: 'Rental Reporters',
    type: 'RENT_REPORTING',
    description: 'Report up to 2 years of past rental payments to boost score instantly.',
    annualFee: 50,
    creditImpact: 'MEDIUM',
    approvalOdds: 'EXCELLENT',
    features: ['Backdating Available', 'Boosts TransUnion & Equifax', 'No Debt Added'],
    imageUrl: 'https://via.placeholder.com/150/10b981/ffffff?text=Rent',
    applyLink: '#'
  },
  {
    id: 'prod_4',
    name: 'Mission Lane Visa',
    issuer: 'Transportation Alliance',
    type: 'UNSECURED_CARD',
    description: 'Unsecured credit for fair credit scores. Higher limits over time.',
    annualFee: 0,
    apr: '26.9% - 29.9%',
    creditImpact: 'HIGH',
    approvalOdds: 'FAIR',
    features: ['No Security Deposit', 'Instant Decision', 'Credit Education'],
    imageUrl: 'https://via.placeholder.com/150/f59e0b/ffffff?text=Mission',
    applyLink: '#'
  },
  {
    id: 'prod_5',
    name: 'Cred.ai Unicorn',
    issuer: 'WSFS Bank',
    type: 'SECURED_CARD',
    description: 'High-tech secured card that acts like debit. No fees, no interest.',
    annualFee: 0,
    apr: '0%',
    minDeposit: 0,
    creditImpact: 'MEDIUM',
    approvalOdds: 'GOOD',
    features: ['Metal Card', 'Automated Security', 'No Fees'],
    imageUrl: 'https://via.placeholder.com/150/000000/ffffff?text=Unicorn',
    applyLink: '#'
  }
];

export const getCreditProducts = async (): Promise<CreditProduct[]> => {
  // Simulate API delay
  return new Promise(resolve => setTimeout(() => resolve(MOCK_PRODUCTS), 600));
};

export const getAiProductRecommendations = async (user: User, products: CreditProduct[]): Promise<CreditProduct[]> => {
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

    // Merge AI data into products
    const rankedProducts = products.map(p => {
      const rec = recommendations.find((r: any) => r.id === p.id);
      if (rec) {
        return { ...p, matchScore: rec.matchScore, aiReasoning: rec.aiReasoning };
      }
      return { ...p, matchScore: 50, aiReasoning: "Standard option available for your profile." };
    });

    // Sort by match score
    return rankedProducts.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  } catch (error) {
    console.error("Gemini Market Error:", error);
    return products; // Fallback to unranked list
  }
};
