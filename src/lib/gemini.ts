import { GoogleGenAI } from '@google/genai';

let cachedPrimaryClient: GoogleGenAI | null = null;
let cachedSecondaryClient: GoogleGenAI | null = null;

/**
 * Resolves the Gemini API key from environment variables, supporting multiple aliases
 * and stripping any accidental quotes pasted into deployment dashboards.
 */
export function getResolvedApiKey(): string | null {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!raw) return null;
  return raw.trim().replace(/^["']|["']$/g, '');
}

export function isGeminiKeyConfigured(): boolean {
  return Boolean(getResolvedApiKey());
}

/**
 * Retrieves or initializes a GoogleGenAI SDK client.
 * If GEMINI_API_KEY_SECONDARY is configured in environment, dedicates
 * separate API keys to the Planner and Coder stages to double rate limits.
 */
export function getGeminiClient(role: 'primary' | 'planner' | 'coder' = 'primary'): GoogleGenAI {
  const primaryKey = getResolvedApiKey();
  const secondaryKey = process.env.GEMINI_API_KEY_SECONDARY?.trim().replace(/^["']|["']$/g, '');

  if (!primaryKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Please provide a valid Gemini API key in your environment or .env.local.'
    );
  }

  // If a secondary key is configured and role is 'planner', use secondary key
  if (role === 'planner' && secondaryKey) {
    if (!cachedSecondaryClient) {
      cachedSecondaryClient = new GoogleGenAI({ apiKey: secondaryKey });
    }
    return cachedSecondaryClient;
  }

  // Otherwise, use primary client
  if (!cachedPrimaryClient) {
    cachedPrimaryClient = new GoogleGenAI({ apiKey: primaryKey });
  }
  return cachedPrimaryClient;
}

/**
 * Returns the primary model name to use for generation.
 * Defaults to 'gemini-3.5-flash-lite' for ultra-fast, high-throughput, zero-bottleneck generation.
 */
export function getPrimaryModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
}

/**
 * Returns the fallback model for recovery loops.
 */
export function getFallbackModel(): string {
  return 'gemini-2.5-flash';
}

export interface ResilientGenerateOptions {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  model?: string;
}

/**
 * Helper to delay execution for exponential backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini with automatic exponential backoff retry and model fallback cascade
 * (e.g. gemini-3.8-flash -> gemini-2.5-flash -> gemini-2.0-flash) when encountering
 * transient high-demand (503) or rate-limit (429) errors.
 */
export async function generateContentResiliently(
  client: GoogleGenAI,
  options: ResilientGenerateOptions
): Promise<{ text: string; modelUsed: string }> {
  const primary = options.model || getPrimaryModel();
  const candidateModels = Array.from(
    new Set([primary, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'])
  );

  let lastError: unknown = null;

  for (const model of candidateModels) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const config: Record<string, unknown> = {};
        if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
        if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
        if (options.responseSchema) config.responseSchema = options.responseSchema;
        if (typeof options.temperature === 'number') config.temperature = options.temperature;

        const response = await client.models.generateContent({
          model,
          contents: options.contents,
          config,
        });

        return {
          text: response.text || '',
          modelUsed: model,
        };
      } catch (err: unknown) {
        lastError = err;
        const errString = String(err);
        const isTransient =
          errString.includes('503') ||
          errString.includes('high demand') ||
          errString.includes('UNAVAILABLE') ||
          errString.includes('429') ||
          errString.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt < maxAttempts) {
          const waitTime = attempt * 1500;
          console.warn(
            `Model ${model} experienced temporary demand spike (attempt ${attempt}/${maxAttempts}). Retrying in ${waitTime}ms...`
          );
          await sleep(waitTime);
          continue;
        }

        console.warn(
          `Model ${model} request did not succeed. Cascading to next available model... Error: ${errString}`
        );
        break; // break inner loop to try next candidate model
      }
    }
  }

  throw lastError || new Error('All candidate models exhausted without successful generation.');
}
