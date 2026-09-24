import { NextRequest, NextResponse } from 'next/server';
import {
  GenerateGameRequestSchema,
  GenerateGameResponse,
  GameObjective,
} from '@/types/game';
import {
  getGeminiClient,
  getPrimaryModel,
  generateContentResiliently,
} from '@/lib/gemini';
import {
  MASTER_SYSTEM_PROMPT,
  buildUserPrompt,
} from '@/lib/prompts';
import { generatePedagogicalBlueprint } from '@/lib/planner';
import { parseGameOutput } from '@/lib/sanitizer';
import { verifyGameCode } from '@/lib/verifier';
import { repairGameHtml } from '@/lib/repair';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateGameResponse>> {
  try {
    // 1. Parse and validate request JSON body
    let bodyJson: unknown;
    try {
      bodyJson = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          title: '',
          html: '',
          takeaways: [],
          message: 'Invalid JSON payload received in request body.',
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const parseResult = GenerateGameRequestSchema.safeParse(bodyJson);
    if (!parseResult.success) {
      const issueMessage = parseResult.error.errors
        .map((err) => `${err.path.join('.') || 'body'}: ${err.message}`)
        .join('; ');

      return NextResponse.json(
        {
          status: 'error',
          title: '',
          html: '',
          takeaways: [],
          message: `Request validation failed: ${issueMessage}`,
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { topic, level, userIntent } = parseResult.data;

    // 2. Initialize Google Gen AI client
    const client = getGeminiClient('coder');
    const primaryModel = getPrimaryModel();

    // University-level prompts produce ~20-25 KB HTML. With a tighter per-call timeout
    // each model attempt fails faster, leaving budget for one cascade fallback within 60s.
    const isUniversity = level === 'university';
    const callTimeoutMs = isUniversity ? 20000 : 32000;

    // 3. Synthesize Master Game in a single resilient pass (~12-16s)
    const prompt = buildUserPrompt(topic, level, userIntent);

    let rawAiText = '';
    try {
      const result = await generateContentResiliently(client, {
        model: primaryModel,
        contents: prompt,
        systemInstruction: MASTER_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.7,
        timeoutMs: callTimeoutMs,
      });

      rawAiText = result.text;
    } catch (generationError: unknown) {
      const message = generationError instanceof Error ? generationError.message : String(generationError);
      return NextResponse.json(
        {
          status: 'error',
          title: '',
          html: '',
          takeaways: [],
          message: `AI generation failed across available models: ${message}`,
        },
        { status: 503, headers: CORS_HEADERS }
      );
    }

    if (!rawAiText || rawAiText.trim() === '') {
      return NextResponse.json(
        {
          status: 'error',
          title: '',
          html: '',
          takeaways: [],
          message: 'AI generation engine returned an empty response.',
        },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    // 4. Parse AI output into structured game schema
    const structuredOutput = parseGameOutput(rawAiText, topic);

    // 5. Automated Headless QA & Code Verifier Agent
    let qaReport = verifyGameCode(structuredOutput.html);
    let finalHtml = qaReport.sanitizedHtml;

    // 6. Automated Self-Healing QA Repair Loop (only if syntax/execution fails)
    // Skipped for University level — repair adds 20-30s which would exceed Vercel's 60s maxDuration.
    if (!qaReport.passed && !isUniversity) {
      const errorSummary = qaReport.errors.join('; ');
      console.warn(
        `Automated QA verifier detected code issues: "${errorSummary}". Dispatching repair agent...`
      );

      const repairResult = await repairGameHtml(
        client,
        structuredOutput.html,
        errorSummary
      );

      if (repairResult.success) {
        finalHtml = repairResult.html;
        console.log('Automated QA repair successfully fixed the code issues.');
      } else {
        console.warn('Self-healing repair loop did not fully pass QA, using sanitized HTML:', repairResult.error);
      }
    }

    // 7. Format educational takeaways (enforcing 2 to 4 items)
    let finalTakeaways = structuredOutput.takeaways.filter((item) => typeof item === 'string' && item.trim().length > 0);
    if (finalTakeaways.length < 2) {
      finalTakeaways.push(
        `Fundamental principles of ${topic}`,
        'Experimental cause-and-effect relationship'
      );
    }
    if (finalTakeaways.length > 4) {
      finalTakeaways = finalTakeaways.slice(0, 4);
    }

    // 8. Derive Challenge Objectives for Learning HUD
    const objectives: GameObjective[] =
      structuredOutput.objectives && structuredOutput.objectives.length > 0
        ? structuredOutput.objectives
        : [
            { label: `Master fundamental principles of ${topic}`, done: false },
            { label: `Maintain streak and complete all stages`, done: false },
            { label: `Observe the 'What Changed?' transition explanations`, done: false },
          ];

    // 9. Return guaranteed successful response with CORS
    return NextResponse.json(
      {
        status: 'success',
        title: structuredOutput.title || `${topic} Interactive Lab`,
        html: finalHtml,
        takeaways: finalTakeaways,
        objectives,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Unhandled error in /api/generate-game:', error);

    return NextResponse.json(
      {
        status: 'error',
        title: '',
        html: '',
        takeaways: [],
        message: `An internal error occurred during game generation: ${errorMessage}`,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
