import { dispatchGeminiAction } from './lib/geminiCore';

/**
 * Vercel serverless: POST { action: string, payload: unknown } -> { result: unknown }
 * Set API_KEY or GEMINI_API_KEY in the Vercel project environment (not VITE_*).
 */
export default async function handler(req: { method?: string; body?: unknown }, res: {
  status: (n: number) => { json: (b: unknown) => void };
}) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as { action?: string; payload?: unknown } | undefined;
  const action = body?.action;
  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'Missing action' });
  }

  try {
    const result = await dispatchGeminiAction(action, body.payload);
    return res.status(200).json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    console.error('api/gemini error:', err);
    return res.status(500).json({ error: message });
  }
}
