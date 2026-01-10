# CreditFix AI - CRM Platform

A comprehensive, AI-powered Credit Repair Business CRM built with Next.js, Firebase, and Gemini API.

## Features

- **AI Dispute Engine**: Generates factual dispute letters using Google Gemini models.
- **Credit Analysis**: OCR and document analysis for credit reports.
- **Client CRM**: Manage leads, clients, and negative items.
- **Predictive Analytics**: Forecast credit score improvements and business revenue.
- **Automation**: Workflow builder for email sequences and task management.
- **Secure**: Role-based access control and encrypted document storage.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI**: Google Gemini API (`@google/genai`)
- **Deployment**: Vercel

## Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Environment Setup**:
   - Copy `.env.example` to `.env.local`
   - Add your Firebase Config keys
   - Add your Google Gemini API key (`API_KEY`)
4. **Run Development Server**: `npm run dev`

## Firebase Setup

1. Create a project in the Firebase Console.
2. Enable **Authentication** (Email/Password, Google).
3. Enable **Firestore Database**.
4. Enable **Storage**.
5. Copy the configuration object to `.env.local`.
6. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

## Folder Structure

- `/pages`: React components for each route.
- `/components`: Reusable UI components.
- `/services`: API wrappers (Gemini, Firebase, Integration).
- `/api`: Next.js API routes (Admin SDK).
- `/types`: TypeScript interfaces.

## Testing

- Unit tests: `npm test`
- Manual testing: Use the `SupportCenter` or `AnalysisEngine` with sample data provided in `constants.ts` or upload real files.
