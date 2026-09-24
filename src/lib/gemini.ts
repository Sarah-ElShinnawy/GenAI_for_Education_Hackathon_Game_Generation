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
 * Defaults to 'gemini-flash-lite-latest' for high-throughput, low-latency, and zero daily quota locks.
 */
export function getPrimaryModel(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (
    !envModel ||
    envModel === 'gemini-3.5-flash-lite' ||
    envModel === 'gemini-2.5-flash-lite' ||
    envModel === 'gemini-2.0-flash'
  ) {
    return 'gemini-flash-lite-latest';
  }
  return envModel;
}

/**
 * Returns the fallback model for recovery loops.
 */
export function getFallbackModel(): string {
  return 'gemini-3.6-flash';
}

export interface ResilientGenerateOptions {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  model?: string;
  timeoutMs?: number;
}

/**
 * Helper to wrap any promise with a strict timeout rejection.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMsg));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Calls Gemini with automatic fast per-call timeout and model fallback cascade
 * (gemini-flash-lite-latest -> gemini-2.5-flash -> gemini-3.6-flash -> gemini-3.5-flash-lite)
 * when encountering timeouts, transient high-demand (503), rate-limit (429), or busy servers.
 */
export async function generateContentResiliently(
  client: GoogleGenAI,
  options: ResilientGenerateOptions
): Promise<{ text: string; modelUsed: string }> {
  const primary = options.model || getPrimaryModel();
  const candidateModels = Array.from(
    new Set([
      // ── Tier 1: 500 RPD Flash Lite models — exhaust these first ──────────
      'gemini-flash-lite-latest',   // gemini-3.5-flash-lite alias, 500 RPD, ~20s per game
      'gemini-3.5-flash-lite',      // explicit name, 500 RPD
      'gemini-3.1-flash-lite',      // 500 RPD, near-zero usage
      // ── Primary model override (if set, placed after lite tier) ───────────
      primary,
      // ── Tier 2: 20 RPD Flash models — use only when all Lite exhausted ───
      'gemini-3.6-flash',           // 20 RPD, 13/20 used today
      'gemini-3.8-flash',           // 20 RPD, 18/20 used today — nearly gone
      'gemini-2.5-flash',           // 20 RPD, already OVER limit — last resort
    ])
  );

  // Per-call timeout: 32s default allows full HTML code synthesis (typically ~20-24s) to complete
  const callTimeoutMs = options.timeoutMs || 32000;
  let lastError: unknown = null;

  for (const model of candidateModels) {
    try {
      console.log(`[GeminiCascade] Invoking model "${model}" (timeout: ${callTimeoutMs / 1000}s)...`);
      const config: Record<string, unknown> = {};
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
      if (options.responseSchema) config.responseSchema = options.responseSchema;
      if (typeof options.temperature === 'number') config.temperature = options.temperature;

      // Disable extended reasoning thinkingBudget on 2.5-flash to avoid 50s reasoning delays.
      // Do NOT pass thinkingConfig to flash-lite models as it triggers 400 INVALID_ARGUMENT.
      if (model.includes('2.5-flash') && !model.includes('lite')) {
        config.thinkingConfig = { thinkingBudget: 0 };
      }

      const responsePromise = client.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      const response = await withTimeout(
        responsePromise,
        callTimeoutMs,
        `Model ${model} timed out after ${callTimeoutMs / 1000}s without responding.`
      );

      if (!response.text || response.text.trim() === '') {
        throw new Error(`Model ${model} returned empty content.`);
      }

      console.log(`[GeminiCascade] Successfully received response from model "${model}".`);
      return {
        text: response.text,
        modelUsed: model,
      };
    } catch (err: unknown) {
      lastError = err;
      const errString = err instanceof Error ? err.message : String(err);
      console.warn(
        `[GeminiCascade] Model "${model}" failed or timed out (${errString}). Cascading to next fallback model...`
      );
      // Immediately cascade to next candidate model in the list
      continue;
    }
  }

  throw lastError || new Error('All candidate models exhausted without successful generation.');
}
