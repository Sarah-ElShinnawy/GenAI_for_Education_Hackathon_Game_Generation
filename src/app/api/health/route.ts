import { NextResponse } from 'next/server';
import { getResolvedApiKey, getGeminiClient, getPrimaryModel } from '@/lib/gemini';

export async function GET() {
  const apiKey = getResolvedApiKey();

  // Determine which environment variable is providing the key
  const detectedVar = process.env.GEMINI_API_KEY
    ? 'GEMINI_API_KEY'
    : process.env.GOOGLE_API_KEY
    ? 'GOOGLE_API_KEY'
    : process.env.NEXT_PUBLIC_GEMINI_API_KEY
    ? 'NEXT_PUBLIC_GEMINI_API_KEY'
    : process.env.GEMINI_KEY
    ? 'GEMINI_KEY'
    : process.env.GOOGLE_GENAI_API_KEY
    ? 'GOOGLE_GENAI_API_KEY'
    : null;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: 'warning',
        hasKey: false,
        message:
          'GEMINI_API_KEY is not detected in the current deployment environment. If you recently added it to Vercel, please trigger a redeploy so Vercel can bake the new variable into the deployment.',
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  const maskedKey =
    apiKey.length > 8
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : '***';

  const model = getPrimaryModel();

  // Test live connectivity with Google Gemini
  try {
    const ai = getGeminiClient('primary');
    const response = await ai.models.generateContent({
      model,
      contents: 'Respond with the word OK if you can read this.',
    });

    const reply = response.text ? response.text.trim() : 'OK';

    return NextResponse.json(
      {
        status: 'healthy',
        hasKey: true,
        detectedVar,
        keyLength: apiKey.length,
        maskedKey,
        model,
        connectivity: 'verified',
        geminiEcho: reply,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        hasKey: true,
        detectedVar,
        keyLength: apiKey.length,
        maskedKey,
        model,
        connectivity: 'failed',
        errorMessage: error.message || 'Unknown error communicating with Gemini API',
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
