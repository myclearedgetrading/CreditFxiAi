
# CreditFix AI

A **DIY-first personal credit repair** web application: audit imported reports, draft AI-assisted disputes, track progress, and learn credit concepts. The Firebase data model is **multi-tenant** (companies, roles, shared `companyId`) so the same codebase can support agencies and platform operations, but the **primary navigation and copy target individual consumers**, not a full agency CRM workflow.

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS, React Router (**HashRouter**), Firebase (Auth, Firestore, Storage), and **Vercel serverless** routes that proxy Google Gemini (`@google/genai`) so API keys stay on the server.

## What’s in the app

- **Overview (`/dashboard`)** — Score snapshot, quick actions, optional repair tasks/deadlines when advanced DIY features are enabled.
- **Credit Audit (`/analysis`)** — Upload and analyze credit report content (HTML, images, PDF) via Gemini-backed server actions.
- **Dispute Center (`/disputes`)** — Guided dispute letter generation, evidence attachment, and (when enabled) closed-loop / template experiment flows.
- **Progress Tracker (`/analytics`)** — Charts and an AI “coach” summary; template variant analytics when `VITE_ENABLE_TEMPLATE_EXPERIMENTS` is on.
- **Education Hub (`/learning`)** — Learning content and tutor-style interactions powered by Gemini.
- **Marketplace (`/marketplace`)** — Credit-product style listings and AI-assisted recommendations (see `services/marketplaceService.ts`).
- **Business Funding (`/funding`)** — Funding-plan style flows (Gemini `generateFundingPlan`).
- **Rewards (`/rewards`)** — Gamification center.
- **Settings (`/settings`)** — Profile, subscription, documents, and tabs for **Integrations**, **Automation**, and **Security** (embedded pages).
- **Communication (`/communication`)**, **Support (`/support`)** — In-app hubs for messaging/help workflows.
- **Clients (`/clients`)** — List view wired to Firestore; some actions are still placeholder UI (e.g. “add client” alerts).
- **Admin (`/admin`)** — Platform admins only (`AdminRoute` + `isPlatformAdmin`); user provisioning uses `/api/admin` with Firebase Admin SDK.

**Public:** landing (`/`), login, onboarding. **Authenticated:** everything under `Layout` except `/admin`, which adds an extra admin gate.

## AI and server API

Browser code calls **`POST /api/gemini`** with `{ action, payload }` and a Firebase ID token. The handler (`api/gemini.ts`) validates actions, applies rate limits, and dispatches to Gemini. Examples of actions include dispute letters, credit report analysis (HTML/image/PDF), executive summaries, education/quiz generation, support ticket analysis, dispute outcome prediction, and closed-loop repair orchestration helpers.

Additional routes:

- **`/api/dispute-orchestrator`** — Authenticated dispute round orchestration (state transitions + Gemini).
- **`/api/admin`** — Authenticated admin operations (e.g. creating users); requires `FIREBASE_SERVICE_ACCOUNT_KEY` (or equivalent Admin setup) in the server environment.

There are **no Firebase Cloud Functions** in `firebase.json`; server logic for this repo is intended to run on **Vercel** alongside the static SPA.

## Feature flags (staged rollout)

Set in `.env.local` (see `.env.example`):

```env
VITE_ENABLE_NEXT_LEVEL_DIY=false
VITE_ENABLE_TEMPLATE_EXPERIMENTS=false
```

- **`VITE_ENABLE_NEXT_LEVEL_DIY`** — Extra dashboard/dispute steps (e.g. task lists, extended dispute wizard sections).
- **`VITE_ENABLE_TEMPLATE_EXPERIMENTS`** — Template experiment tracking on disputes and extra analytics on Progress Tracker.

## API key setup (Gemini)

The app never embeds the Gemini key in the Vite client bundle.

1. Create a key in [Google AI Studio](https://aistudio.google.com/).
2. **Local:** add to `.env` or `.env.local`:
   ```env
   API_KEY=your_api_key_here
   ```
   `GEMINI_API_KEY` is also accepted.
3. **Vercel:** set `API_KEY` or `GEMINI_API_KEY` for Production / Preview.
4. **Local API routes:** `npm run dev` only runs Vite; use **`npm run dev:vercel`** so `/api/*` is served (requires [Vercel CLI](https://vercel.com/docs/cli)), or test AI after deploy.

## Setup

1. Clone the repository.
2. **Install dependencies:** `npm install`
3. **Environment**
   - Firebase web config (used by the client), e.g. in `.env.local`:
     ```env
     VITE_FIREBASE_API_KEY=
     VITE_FIREBASE_AUTH_DOMAIN=
     VITE_FIREBASE_PROJECT_ID=
     VITE_FIREBASE_STORAGE_BUCKET=
     VITE_FIREBASE_MESSAGING_SENDER_ID=
     VITE_FIREBASE_APP_ID=
     ```
   - **`API_KEY`** or **`GEMINI_API_KEY`** for server-side Gemini (see above).
   - Optional: **`FIREBASE_SERVICE_ACCOUNT_KEY`** (JSON string) for `/api/admin` and Admin SDK usage in API routes.
   - Feature flags (optional): see previous section.
4. **Run**
   - UI only: `npm run dev` (default Vite port **3000** per `vite.config.ts`).
   - UI + API: `npm run dev:vercel`

## Firebase

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (the in-app `Login` page uses **Email/Password**; you can add other providers in Firebase if you extend the UI).
3. Enable **Firestore** and **Storage**.
4. Deploy rules and indexes (CLI must target this project):

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Pre-flight:

```bash
npm run check:firebase:ready
```

Seed template experiment baseline (server credentials required):

```bash
npm run seed:template-experiment -- <companyId>
```

### Data model (multi-tenant)

- Collections include `users`, `companies`, `clients`, `disputes`, `tickets`, `activityLogs`, and (when experiments are on) `templateExperiments`.
- Tenant isolation uses **`companyId`**. Solo DIY users typically use **`companyId === their Firebase uid`** (see app bootstrap / `tenantCompanyId` in `firebaseService`).
- Agency staff share a **`companyId`**; **`role`** distinguishes `USER`, `SPECIALIST`, `ADMIN`, etc.
- Documents that are tenant-scoped should include **`companyId`** consistent with the signed-in profile (see `firestore.rules`).

Composite indexes are listed in **`firestore.indexes.json`** (e.g. `tickets` by `companyId` + `updatedAt`, `disputes` by `companyId` + `clientId`). Create missing indexes from CLI output or the console link in the browser if Firestore requests them.

## Security notes

- **Vercel** `vercel.json` sets CSP, HSTS, frame denial, and related headers for production-style deployments.
- **Firestore** and **Storage** rules in-repo should be deployed with the project.
- Gemini and admin operations run **only** on the server (`/api/*`), not in the client bundle.

## PWA / offline

- `manifest.json` and install UI (`beforeinstallprompt`) support “add to home screen” behavior.
- A **service worker** file exists (`service-worker.js`), but registration is **commented out** in `index.tsx` to avoid preview-environment issues; re-enable when you want full offline caching.

## Folder structure (high level)

- **`/pages`** — Route-level screens.
- **`/components`** — Layout, routes, shared UI.
- **`/context`** — Theme and user session context.
- **`/services`** — Firebase, Gemini client wrapper, integrations, mobile helpers, feature flags.
- **`/api`** — Vercel serverless handlers (`gemini`, `admin`, `dispute-orchestrator`) and shared `lib/`.
- **`/tests`** — Firestore and Storage rules tests (`npm run test:security`).

## Testing

- **Security rules:** `npm run test:security` (Firestore + Storage rules tests via emulators).
- **Manual:** exercise flows from Support, Credit Audit, or sample data in `constants.ts` where applicable.
