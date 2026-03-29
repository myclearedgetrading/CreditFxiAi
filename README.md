
# CreditFix AI - CRM Platform

A comprehensive, AI-powered Credit Repair Business CRM built with React, Firebase, and Gemini API.

## Features

- **AI Dispute Engine**: Generates factual dispute letters using Google Gemini models.
- **Credit Analysis**: OCR and document analysis for credit reports.
- **Client CRM**: Manage leads, clients, and negative items.
- **Predictive Analytics**: Forecast credit score improvements and business revenue.
- **Automation**: Workflow builder for email sequences and task management.
- **Secure**: Role-based access control and encrypted document storage.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI**: Google Gemini API (`@google/genai`)
- **Build Tool**: Vite

## API key setup (Gemini)

The app calls **`/api/gemini`** on the server so your Gemini key is **never** embedded in the Vite client bundle.

1. Get a key from [Google AI Studio](https://aistudio.google.com/).
2. **Local:** add to `.env` or `.env.local` (loaded by Vite for Firebase vars; Vercel CLI also reads `.env` for serverless):
   ```env
   API_KEY=your_api_key_here
   ```
   You can use `GEMINI_API_KEY` instead of `API_KEY` if you prefer.
3. **Vercel:** set `API_KEY` or `GEMINI_API_KEY` in the project **Environment Variables** (Production / Preview).
4. **Local AI routes:** plain `npm run dev` does not run Vercel functions. Use **`npm run dev:vercel`** (requires [Vercel CLI](https://vercel.com/docs/cli)) so `/api/gemini` is available, or test AI after deploy.

## Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Environment**
   - Add Firebase client keys: `VITE_FIREBASE_*` (see below).
   - Add **`API_KEY`** (or `GEMINI_API_KEY`) for Gemini on the **server** (see above).
   - Optional: `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string) for `/api/admin` user provisioning.
4. **Run app**
   - UI only: `npm run dev`
   - UI + API routes: `npm run dev:vercel`

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
- `/api`: Vercel serverless handlers (e.g. Gemini proxy, Admin SDK).
- `/types`: Shared TypeScript types.

## Testing

- Manual: use `SupportCenter`, `AnalysisEngine`, or sample data in `constants.ts`.
